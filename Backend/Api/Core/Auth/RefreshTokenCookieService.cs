namespace Api.Core.Auth
{
  using Microsoft.Extensions.Options;

  public sealed class RefreshTokenCookieService
  {
    public const string CookiePath = "/api/auth";

    private readonly JwtSettings _settings;
    private readonly IWebHostEnvironment _environment;
    private readonly TimeProvider _timeProvider;

    public RefreshTokenCookieService(
      IOptions<JwtSettings> settings,
      IWebHostEnvironment environment,
      TimeProvider timeProvider)
    {
      _settings = settings.Value;
      _environment = environment;
      _timeProvider = timeProvider;
    }

    public string CookieName => _settings.RefreshCookieName;

    public void Append(HttpResponse response, string rawToken, DateTime expiresAt)
    {
      var expiresAtUtc = DateTime.SpecifyKind(expiresAt, DateTimeKind.Utc);
      var now = _timeProvider.GetUtcNow();

      response.Cookies.Append(CookieName, rawToken, new CookieOptions
      {
        HttpOnly = true,
        Secure = IsSecure(response),
        SameSite = SameSiteMode.Strict,
        Path = CookiePath,
        IsEssential = true,
        Expires = new DateTimeOffset(expiresAtUtc),
        MaxAge = expiresAtUtc - now.UtcDateTime
      });
    }

    public void Delete(HttpResponse response)
    {
      response.Cookies.Delete(CookieName, new CookieOptions
      {
        HttpOnly = true,
        Secure = IsSecure(response),
        SameSite = SameSiteMode.Strict,
        Path = CookiePath,
        IsEssential = true
      });
    }

    private bool IsSecure(HttpResponse response)
    {
      return !_environment.IsDevelopment() || response.HttpContext.Request.IsHttps;
    }
  }
}
