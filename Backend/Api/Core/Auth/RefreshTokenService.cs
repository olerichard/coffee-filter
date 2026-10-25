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

    Task<RefreshTokenRotationResult> RotateAsync(
      string rawToken,
      string? ipAddress,
      string? userAgent,
      CancellationToken cancellationToken);

    Task RevokeAsync(
      string? rawToken,
      string reason,
      CancellationToken cancellationToken);

    Task<int> RevokeFamilyAsync(
      Guid familyId,
      int userId,
      string reason,
      CancellationToken cancellationToken);

    Task RevokeAllForUserAsync(
      int userId,
      string reason,
      CancellationToken cancellationToken);

    Task<IReadOnlyList<SessionSummary>> GetSessionsAsync(
      int userId,
      Guid? currentFamilyId,
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
      var familyExpiresAt = now.AddDays(_settings.RefreshTokenAbsoluteDays);
      var slidingExpiresAt = now.AddDays(_settings.RefreshTokenDays);
      var expiresAt = slidingExpiresAt < familyExpiresAt ? slidingExpiresAt : familyExpiresAt;

      var rawToken = RefreshTokenHasher.Generate();
      var familyId = Guid.NewGuid();

      var entity = new RefreshTokenEntity
      {
        UserId = user.Id,
        TokenHash = RefreshTokenHasher.Hash(rawToken),
        FamilyId = familyId,
        FamilyExpiresAt = familyExpiresAt,
        ExpiresAt = expiresAt,
        CreatedAt = now,
        CreatedByIp = Truncate(ipAddress, 45),
        UserAgent = Truncate(userAgent, 512)
      };

      _dbContext.RefreshTokens.Add(entity);
      await _dbContext.SaveChangesAsync(cancellationToken);

      return new RefreshTokenCreationResult(rawToken, expiresAt, familyId);
    }

    public async Task<RefreshTokenRotationResult> RotateAsync(
      string rawToken,
      string? ipAddress,
      string? userAgent,
      CancellationToken cancellationToken)
    {
      var now = _timeProvider.GetUtcNow().UtcDateTime;
      var hash = RefreshTokenHasher.Hash(rawToken);

      await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

      var token = await _dbContext.RefreshTokens
        .AsNoTracking()
        .Include(t => t.User)
        .FirstOrDefaultAsync(t => t.TokenHash == hash, cancellationToken);

      if (token is null)
      {
        return new RefreshTokenRotationResult(RefreshTokenRotationStatus.Invalid);
      }

      if (!token.User.IsActive)
      {
        await RevokeFamilyInternalAsync(
          token.FamilyId,
          token.UserId,
          RefreshTokenRevocationReasons.InactiveUser,
          now,
          cancellationToken);

        await transaction.CommitAsync(cancellationToken);

        _logger.LogWarning(
          "Refresh blocked for inactive user {UserId}. Family {FamilyId} revoked.",
          token.UserId,
          token.FamilyId);

        return new RefreshTokenRotationResult(RefreshTokenRotationStatus.InactiveUser);
      }

      if (token.RevokedAt is not null)
      {
        var isWithinGracePeriod =
          token.RevokedReason == RefreshTokenRevocationReasons.Rotated &&
          now - token.RevokedAt.Value <= TimeSpan.FromSeconds(_settings.RefreshReuseGraceSeconds);

        if (isWithinGracePeriod)
        {
          // A second tab or an immediate retry rotated the token first. Do not
          // revoke the family; the client will retry with the newer cookie.
          return new RefreshTokenRotationResult(RefreshTokenRotationStatus.ReusedGrace);
        }

        await RevokeFamilyInternalAsync(
          token.FamilyId,
          token.UserId,
          RefreshTokenRevocationReasons.ReuseDetected,
          now,
          cancellationToken);

        await transaction.CommitAsync(cancellationToken);

        _logger.LogWarning(
          "Refresh token reuse detected for user {UserId}. Family {FamilyId} revoked. IP {IpAddress}.",
          token.UserId,
          token.FamilyId,
          Truncate(ipAddress, 45));

        return new RefreshTokenRotationResult(RefreshTokenRotationStatus.Reused);
      }

      if (token.ExpiresAt <= now || token.FamilyExpiresAt <= now)
      {
        return new RefreshTokenRotationResult(RefreshTokenRotationStatus.Expired);
      }

      var rawNewToken = RefreshTokenHasher.Generate();
      var newTokenHash = RefreshTokenHasher.Hash(rawNewToken);
      var familyExpiresAt = token.FamilyExpiresAt;
      var slidingExpiresAt = now.AddDays(_settings.RefreshTokenDays);
      var newExpiresAt = slidingExpiresAt < familyExpiresAt ? slidingExpiresAt : familyExpiresAt;

      var updated = await _dbContext.RefreshTokens
        .Where(t => t.Id == token.Id && t.RevokedAt == null)
        .ExecuteUpdateAsync(setters => setters
          .SetProperty(t => t.RevokedAt, (DateTime?)now)
          .SetProperty(t => t.RevokedReason, RefreshTokenRevocationReasons.Rotated)
          .SetProperty(t => t.ReplacedByTokenHash, newTokenHash),
          cancellationToken);

      if (updated == 0)
      {
        // Another request won the race. Treat it like the grace-period case
        // so the client can retry with the cookie set by the winner.
        return new RefreshTokenRotationResult(RefreshTokenRotationStatus.ReusedGrace);
      }

      var newToken = new RefreshTokenEntity
      {
        UserId = token.UserId,
        TokenHash = newTokenHash,
        FamilyId = token.FamilyId,
        FamilyExpiresAt = familyExpiresAt,
        ExpiresAt = newExpiresAt,
        CreatedAt = now,
        CreatedByIp = Truncate(ipAddress, 45),
        UserAgent = Truncate(userAgent, 512)
      };

      _dbContext.RefreshTokens.Add(newToken);
      await _dbContext.SaveChangesAsync(cancellationToken);
      await transaction.CommitAsync(cancellationToken);

      return new RefreshTokenRotationResult(
        RefreshTokenRotationStatus.Success,
        rawNewToken,
        newExpiresAt,
        token.User,
        token.FamilyId);
    }

    public async Task RevokeAsync(
      string? rawToken,
      string reason,
      CancellationToken cancellationToken)
    {
      if (string.IsNullOrWhiteSpace(rawToken))
      {
        return;
      }

      var hash = RefreshTokenHasher.Hash(rawToken);
      var token = await _dbContext.RefreshTokens
        .AsNoTracking()
        .FirstOrDefaultAsync(t => t.TokenHash == hash, cancellationToken);

      if (token is null)
      {
        return;
      }

      await RevokeFamilyInternalAsync(
        token.FamilyId,
        token.UserId,
        reason,
        _timeProvider.GetUtcNow().UtcDateTime,
        cancellationToken);
    }

    public async Task<int> RevokeFamilyAsync(
      Guid familyId,
      int userId,
      string reason,
      CancellationToken cancellationToken)
    {
      return await RevokeFamilyInternalAsync(
        familyId,
        userId,
        reason,
        _timeProvider.GetUtcNow().UtcDateTime,
        cancellationToken);
    }

    public async Task RevokeAllForUserAsync(
      int userId,
      string reason,
      CancellationToken cancellationToken)
    {
      var now = _timeProvider.GetUtcNow().UtcDateTime;

      await _dbContext.RefreshTokens
        .Where(t => t.UserId == userId && t.RevokedAt == null)
        .ExecuteUpdateAsync(setters => setters
          .SetProperty(t => t.RevokedAt, (DateTime?)now)
          .SetProperty(t => t.RevokedReason, reason),
          cancellationToken);
    }

    public async Task<IReadOnlyList<SessionSummary>> GetSessionsAsync(
      int userId,
      Guid? currentFamilyId,
      CancellationToken cancellationToken)
    {
      var now = _timeProvider.GetUtcNow().UtcDateTime;

      // Include rotated rows so a session keeps its original creation time,
      // but only surface families that still have an active token.
      var tokens = await _dbContext.RefreshTokens
        .AsNoTracking()
        .Where(t => t.UserId == userId && t.FamilyExpiresAt > now)
        .ToListAsync(cancellationToken);

      return tokens
        .GroupBy(t => t.FamilyId)
        .Select(group =>
        {
          var activeTokens = group
            .Where(t => t.RevokedAt == null && t.ExpiresAt > now)
            .OrderByDescending(t => t.CreatedAt)
            .ToList();

          if (activeTokens.Count == 0)
          {
            return null;
          }

          var latest = activeTokens[0];

          return new SessionSummary(
            group.Key,
            group.Min(t => t.CreatedAt),
            latest.CreatedAt,
            activeTokens.Max(t => t.ExpiresAt),
            latest.CreatedByIp,
            latest.UserAgent,
            currentFamilyId == group.Key);
        })
        .Where(session => session is not null)
        .Select(session => session!)
        .OrderByDescending(session => session.LastUsedAt)
        .ToList();
    }

    private async Task<int> RevokeFamilyInternalAsync(
      Guid familyId,
      int userId,
      string reason,
      DateTime now,
      CancellationToken cancellationToken)
    {
      return await _dbContext.RefreshTokens
        .Where(t => t.FamilyId == familyId && t.UserId == userId && t.RevokedAt == null)
        .ExecuteUpdateAsync(setters => setters
          .SetProperty(t => t.RevokedAt, (DateTime?)now)
          .SetProperty(t => t.RevokedReason, reason),
          cancellationToken);
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
