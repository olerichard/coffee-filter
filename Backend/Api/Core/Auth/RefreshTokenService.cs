namespace Api.Core.Auth
{
  using Api.Database;
  using Api.Database.Entities;
  using Microsoft.EntityFrameworkCore;
  using Microsoft.Extensions.Options;

  public interface IRefreshTokenService
  {
    Task<RefreshTokenCreationResult> CreateAsync(
      UserEntity user,
      string? ipAddress,
      string? userAgent,
      CancellationToken cancellationToken);

    Task<RefreshTokenRotationResult?> RotateAsync(
      string rawToken,
      string? ipAddress,
      string? userAgent,
      CancellationToken cancellationToken);

    Task RevokeAsync(
      string? rawToken,
      CancellationToken cancellationToken);

    Task RevokeAllForUserAsync(
      int userId,
      CancellationToken cancellationToken);
  }

  public class RefreshTokenService : IRefreshTokenService
  {
    private readonly AppDbContext _dbContext;
    private readonly JwtSettings _settings;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<RefreshTokenService> _logger;

    public RefreshTokenService(
      AppDbContext dbContext,
      IOptions<JwtSettings> settings,
      TimeProvider timeProvider,
      ILogger<RefreshTokenService> logger)
    {
      _dbContext = dbContext;
      _settings = settings.Value;
      _timeProvider = timeProvider;
      _logger = logger;
    }

    public async Task<RefreshTokenCreationResult> CreateAsync(
      UserEntity user,
      string? ipAddress,
      string? userAgent,
      CancellationToken cancellationToken)
    {
      var now = _timeProvider.GetUtcNow().UtcDateTime;
      var expiresAt = now.AddDays(_settings.RefreshTokenDays);
      var rawToken = RefreshTokenHasher.Generate();

      _dbContext.RefreshTokens.Add(new RefreshTokenEntity
      {
        UserId = user.Id,
        TokenHash = RefreshTokenHasher.Hash(rawToken),
        ExpiresAt = expiresAt,
        CreatedAt = now,
        CreatedByIp = Truncate(ipAddress, 45),
        UserAgent = Truncate(userAgent, 512)
      });

      await _dbContext.SaveChangesAsync(cancellationToken);

      return new RefreshTokenCreationResult(rawToken, expiresAt);
    }

    public async Task<RefreshTokenRotationResult?> RotateAsync(
      string rawToken,
      string? ipAddress,
      string? userAgent,
      CancellationToken cancellationToken)
    {
      var now = _timeProvider.GetUtcNow().UtcDateTime;
      var hash = RefreshTokenHasher.Hash(rawToken);

      await using var transaction = await _dbContext.Database
        .BeginTransactionAsync(cancellationToken);

      var token = await _dbContext.RefreshTokens
        .AsNoTracking()
        .Include(t => t.User)
        .FirstOrDefaultAsync(t => t.TokenHash == hash, cancellationToken);

      if (token is null)
      {
        return null;
      }

      if (token.ExpiresAt <= now)
      {
        await DeleteByHashAsync(hash, cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return null;
      }

      if (!token.User.IsActive)
      {
        await RevokeAllForUserAsync(token.UserId, cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        _logger.LogWarning(
          "Refresh blocked for inactive user {UserId}. Refresh tokens revoked.",
          token.UserId);

        return null;
      }

      var deleted = await DeleteByHashAsync(hash, cancellationToken);
      if (deleted == 0)
      {
        return null;
      }

      var rawNewToken = RefreshTokenHasher.Generate();
      var newExpiresAt = now.AddDays(_settings.RefreshTokenDays);

      _dbContext.RefreshTokens.Add(new RefreshTokenEntity
      {
        UserId = token.UserId,
        TokenHash = RefreshTokenHasher.Hash(rawNewToken),
        ExpiresAt = newExpiresAt,
        CreatedAt = now,
        CreatedByIp = Truncate(ipAddress, 45),
        UserAgent = Truncate(userAgent, 512)
      });

      await _dbContext.SaveChangesAsync(cancellationToken);
      await transaction.CommitAsync(cancellationToken);

      return new RefreshTokenRotationResult(rawNewToken, newExpiresAt, token.User);
    }

    public async Task RevokeAsync(
      string? rawToken,
      CancellationToken cancellationToken)
    {
      if (string.IsNullOrWhiteSpace(rawToken))
      {
        return;
      }

      await DeleteByHashAsync(RefreshTokenHasher.Hash(rawToken), cancellationToken);
    }

    public async Task RevokeAllForUserAsync(
      int userId,
      CancellationToken cancellationToken)
    {
      await _dbContext.RefreshTokens
        .Where(t => t.UserId == userId)
        .ExecuteDeleteAsync(cancellationToken);
    }

    private async Task<int> DeleteByHashAsync(
      string hash,
      CancellationToken cancellationToken)
    {
      return await _dbContext.RefreshTokens
        .Where(t => t.TokenHash == hash)
        .ExecuteDeleteAsync(cancellationToken);
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
