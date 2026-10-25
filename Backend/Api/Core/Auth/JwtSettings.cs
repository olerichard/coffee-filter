namespace Api.Core.Auth
{
  public class JwtSettings
  {
    public const string SectionName = "JwtSettings";

    public string SecretKey { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int AccessTokenMinutes { get; set; } = 15;
    public int RefreshTokenDays { get; set; } = 30;
    public int RefreshTokenAbsoluteDays { get; set; } = 90;
    public int RefreshReuseGraceSeconds { get; set; } = 30;
    public string RefreshCookieName { get; set; } = "cf_refresh";
  }
}
