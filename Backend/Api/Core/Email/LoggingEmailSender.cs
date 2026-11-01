namespace Api.Core.Email
{
  /// <summary>
  /// Development stand-in for a real mail provider: writes the message, reset
  /// link included, to the API log so the flow can be exercised locally.
  /// </summary>
  public sealed class LoggingEmailSender : IEmailSender
  {
    private readonly ILogger<LoggingEmailSender> _logger;

    public LoggingEmailSender(ILogger<LoggingEmailSender> logger)
    {
      _logger = logger;
    }

    public Task SendAsync(
      EmailMessage message,
      CancellationToken cancellationToken)
    {
      _logger.LogInformation(
        "Email to {Recipient} with subject \"{Subject}\":{NewLine}{TextBody}",
        message.ToAddress,
        message.Subject,
        Environment.NewLine,
        message.TextBody);

      return Task.CompletedTask;
    }
  }
}
