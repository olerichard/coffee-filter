namespace Api.Core.Auth
{
  public class PasswordResetSettings
  {
    public const string SectionName = "PasswordReset";

    public int TokenMinutes { get; set; } = 30;

    /// <summary>
    /// Public origin of the frontend. Reset links are built from this value
    /// rather than the request headers, which the caller controls.
    /// </summary>
    public string FrontendBaseUrl { get; set; } = string.Empty;
  }
}
