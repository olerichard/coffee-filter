namespace Api.Core.Email
{
  using MailKit.Net.Smtp;
  using MailKit.Security;
  using Microsoft.Extensions.Options;
  using MimeKit;

  public sealed class SmtpEmailSender : IEmailSender
  {
    private readonly SmtpSettings _settings;
    private readonly ILogger<SmtpEmailSender> _logger;

    public SmtpEmailSender(
      IOptions<EmailSettings> settings,
      ILogger<SmtpEmailSender> logger)
    {
      _settings = settings.Value.Smtp;
      _logger = logger;
    }

    public async Task SendAsync(
      EmailMessage message,
      CancellationToken cancellationToken)
    {
      using var client = new SmtpClient();

      await client.ConnectAsync(
        _settings.Host,
        _settings.Port,
        ToSecureSocketOptions(_settings.Security),
        cancellationToken);

      if (!string.IsNullOrWhiteSpace(_settings.Username))
      {
        await client.AuthenticateAsync(
          _settings.Username,
          _settings.Password,
          cancellationToken);
      }

      await client.SendAsync(BuildMessage(message), cancellationToken);
      await client.DisconnectAsync(true, cancellationToken);

      _logger.LogInformation(
        "Sent \"{Subject}\" to {Recipient}.",
        message.Subject,
        message.ToAddress);
    }

    private MimeMessage BuildMessage(EmailMessage message)
    {
      var mimeMessage = new MimeMessage();

      mimeMessage.From.Add(new MailboxAddress(
        _settings.FromName,
        _settings.FromAddress));

      mimeMessage.To.Add(new MailboxAddress(
        message.ToName ?? string.Empty,
        message.ToAddress));

      mimeMessage.Subject = message.Subject;

      var body = new BodyBuilder
      {
        TextBody = message.TextBody,
        HtmlBody = message.HtmlBody
      };

      mimeMessage.Body = body.ToMessageBody();

      return mimeMessage;
    }

    private static SecureSocketOptions ToSecureSocketOptions(string security) =>
      security.Trim().ToLowerInvariant() switch
      {
        "ssl" or "ssl-on-connect" => SecureSocketOptions.SslOnConnect,
        "none" => SecureSocketOptions.None,
        _ => SecureSocketOptions.StartTls
      };
  }
}
