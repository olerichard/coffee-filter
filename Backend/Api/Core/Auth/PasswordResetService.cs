namespace Api.Core.Auth
{
  using Api.Database;
  using Api.Database.Entities;
  using Microsoft.AspNetCore.Identity;
  using Microsoft.EntityFrameworkCore;
  using Microsoft.Extensions.Options;

  public interface IPasswordResetService
  {
    /// <summary>
    /// Issues a single-use token for an active account. Returns <c>null</c> for
    /// unknown or inactive emails so callers cannot tell them apart.
    /// </summary>
    Task<PasswordResetRequest?> CreateAsync(
      string email,
      string? ipAddress,
      CancellationToken cancellationToken);

    /// <summary>
    /// Atomically consumes the token, sets the new password, clears any lockout
    /// and signs the user out everywhere. Returns <c>false</c> for missing,
    /// expired, already used or otherwise invalid tokens.
    /// </summary>
    Task<bool> ResetAsync(
      string rawToken,
      string newPassword,
      CancellationToken cancellationToken);
  }

  public class PasswordResetService : IPasswordResetService
  {
    private readonly AppDbContext _dbContext;
    private readonly IPasswordHasher<UserEntity> _passwordHasher;
    private readonly IRefreshTokenService _refreshTokenService;
    private readonly PasswordResetSettings _settings;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<PasswordResetService> _logger;

    public PasswordResetService(
      AppDbContext dbContext,
      IPasswordHasher<UserEntity> passwordHasher,
      IRefreshTokenService refreshTokenService,
      IOptions<PasswordResetSettings> settings,
      TimeProvider timeProvider,
      ILogger<PasswordResetService> logger)
    {
      _dbContext = dbContext;
      _passwordHasher = passwordHasher;
      _refreshTokenService = refreshTokenService;
      _settings = settings.Value;
      _timeProvider = timeProvider;
      _logger = logger;
    }

    public async Task<PasswordResetRequest?> CreateAsync(
      string email,
      string? ipAddress,
      CancellationToken cancellationToken)
    {
      var user = await _dbContext.Users
        .FirstOrDefaultAsync(
          u => u.Email.ToLower() == email && u.IsActive,
          cancellationToken);

      if (user is null)
      {
        return null;
      }

      var now = _timeProvider.GetUtcNow().UtcDateTime;
      var expiresAt = now.AddMinutes(_settings.TokenMinutes);
      var rawToken = OpaqueTokenHasher.Generate();

      // Only the newest link stays valid, so requesting a second email makes
      // the first one useless.
      await _dbContext.PasswordResetTokens
        .Where(t => t.UserId == user.Id)
        .ExecuteDeleteAsync(cancellationToken);

      _dbContext.PasswordResetTokens.Add(new PasswordResetTokenEntity
      {
        UserId = user.Id,
        TokenHash = OpaqueTokenHasher.Hash(rawToken),
        ExpiresAt = expiresAt,
        CreatedAt = now,
        CreatedByIp = Truncate(ipAddress, 45)
      });

      await _dbContext.SaveChangesAsync(cancellationToken);

      return new PasswordResetRequest(user, rawToken, expiresAt);
    }

    public async Task<bool> ResetAsync(
      string rawToken,
      string newPassword,
      CancellationToken cancellationToken)
    {
      var now = _timeProvider.GetUtcNow().UtcDateTime;
      var hash = OpaqueTokenHasher.Hash(rawToken);

      await using var transaction = await _dbContext.Database
        .BeginTransactionAsync(cancellationToken);

      var token = await _dbContext.PasswordResetTokens
        .AsNoTracking()
        .FirstOrDefaultAsync(t => t.TokenHash == hash, cancellationToken);

      if (token is null)
      {
        return false;
      }

      if (token.ExpiresAt <= now)
      {
        await _dbContext.PasswordResetTokens
          .Where(t => t.Id == token.Id)
          .ExecuteDeleteAsync(cancellationToken);

        await transaction.CommitAsync(cancellationToken);
        return false;
      }

      var user = await _dbContext.Users.FindAsync(
        new object?[] { token.UserId },
        cancellationToken);

      if (user is null || !user.IsActive)
      {
        return false;
      }

      // Delete first and require exactly one row: two concurrent uses of the
      // same link must not both succeed.
      var deleted = await _dbContext.PasswordResetTokens
        .Where(t => t.Id == token.Id)
        .ExecuteDeleteAsync(cancellationToken);

      if (deleted == 0)
      {
        return false;
      }

      user.PasswordHash = _passwordHasher.HashPassword(user, newPassword);
      user.AccessFailedCount = 0;
      user.LockoutEnd = null;

      await _refreshTokenService.RevokeAllForUserAsync(
        user.Id,
        cancellationToken);

      await _dbContext.SaveChangesAsync(cancellationToken);
      await transaction.CommitAsync(cancellationToken);

      _logger.LogInformation(
        "Password reset completed for user {UserId}. All refresh tokens revoked.",
        user.Id);

      return true;
    }

    private static string? Truncate(string? value, int maxLength)
    {
      if (string.IsNullOrWhiteSpace(value))
      {
        return null;
      }

      return value.Length <= maxLength ? value : value[..maxLength];
    }
  }
}
