namespace Api.Core.Email
{
  public class EmailSettings
  {
    public const string SectionName = "Email";

    public SmtpSettings Smtp { get; set; } = new();
  }

  public class SmtpSettings
  {
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; } = 587;

    /// <summary>
    /// One of "starttls", "ssl" or "none". Maps to MailKit's
    /// <c>SecureSocketOptions</c>.
    /// </summary>
    public string Security { get; set; } = "starttls";

    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FromAddress { get; set; } = string.Empty;
    public string FromName { get; set; } = "Coffee Filter";
  }
}
