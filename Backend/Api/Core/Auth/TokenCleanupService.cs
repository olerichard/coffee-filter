namespace Api.Core.Auth
{
  using Api.Database;
  using Microsoft.EntityFrameworkCore;

  public sealed class TokenCleanupService : BackgroundService
  {
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<TokenCleanupService> _logger;

    public TokenCleanupService(
      IServiceScopeFactory scopeFactory,
      TimeProvider timeProvider,
      ILogger<TokenCleanupService> logger)
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

        var deleted = await dbContext.RefreshTokens
          .Where(token => token.ExpiresAt < now)
          .ExecuteDeleteAsync(cancellationToken);

        if (deleted > 0)
        {
          _logger.LogInformation(
            "Deleted {Count} expired refresh tokens.",
            deleted);
        }

        var deletedResetTokens = await dbContext.PasswordResetTokens
          .Where(token => token.ExpiresAt < now)
          .ExecuteDeleteAsync(cancellationToken);

        if (deletedResetTokens > 0)
        {
          _logger.LogInformation(
            "Deleted {Count} expired password reset tokens.",
            deletedResetTokens);
        }
      }
      catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
      {
        // Normal shutdown.
      }
      catch (Exception exception)
      {
        _logger.LogError(exception, "Token cleanup failed.");
      }
    }
  }
}
