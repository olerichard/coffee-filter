namespace Api.Core.Auth
{
  public static class RateLimitPolicies
  {
    public const string Login = "login";
    public const string Refresh = "refresh";
    public const string PasswordChange = "password-change";
    public const string Signup = "signup";
    public const string PasswordResetRequest = "password-reset-request";
    public const string PasswordResetSubmit = "password-reset-submit";
  }
}
