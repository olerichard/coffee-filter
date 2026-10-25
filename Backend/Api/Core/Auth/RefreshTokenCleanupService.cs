namespace Api.Core.Auth
{
  using Api.Database;
  using Microsoft.EntityFrameworkCore;

  public sealed class RefreshTokenCleanupService : BackgroundService
  {
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<RefreshTokenCleanupService> _logger;

    public RefreshTokenCleanupService(
      IServiceScopeFactory scopeFactory,
      TimeProvider timeProvider,
      ILogger<RefreshTokenCleanupService> logger)
    {
      _scopeFactory = scopeFactory;
      _timeProvider = timeProvider;
      _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
      await CleanupAsync(stoppingToken);

      using var timer = new PeriodicTimer(TimeSpan.FromHours(24));

      try
      {
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
          await CleanupAsync(stoppingToken);
        }
      }
      catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
      {
        // Normal shutdown.
      }
    }

    private async Task CleanupAsync(CancellationToken cancellationToken)
    {
      try
      {
        using var scope = _scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var now = _timeProvider.GetUtcNow().UtcDateTime;

        // Keep rotated rows for the entire family lifetime so that reuse of an
        // old token can still revoke the family. Once the family's absolute
        // expiry passes, no token from it is useful.
        var deleted = await dbContext.RefreshTokens
          .Where(t => t.FamilyExpiresAt < now)
          .ExecuteDeleteAsync(cancellationToken);

        if (deleted > 0)
        {
          _logger.LogInformation(
            "Deleted {Count} refresh tokens from expired families.",
            deleted);
        }
      }
      catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
      {
        // Normal shutdown.
      }
      catch (Exception exception)
      {
        _logger.LogError(exception, "Refresh token cleanup failed.");
      }
    }
  }
}
