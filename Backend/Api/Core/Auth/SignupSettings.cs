namespace Api.Core.Auth
{
  public class SignupSettings
  {
    public const string SectionName = "Signup";

    public string InviteCode { get; set; } = string.Empty;

    public bool IsEnabled => !string.IsNullOrWhiteSpace(InviteCode);
  }
}
