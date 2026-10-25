namespace Api.Core.Auth
{
  using Api.Database.Entities;
  using Microsoft.Extensions.Options;
  using Microsoft.IdentityModel.Tokens;
  using System.Globalization;
  using System.IdentityModel.Tokens.Jwt;
  using System.Security.Claims;
  using System.Text;

  public sealed record AccessTokenResult(string Token, DateTime ExpiresAt);

  public interface IJwtService
  {
    AccessTokenResult GenerateToken(UserEntity user, Guid sessionId);
  }

  public class JwtService : IJwtService
  {
    private static readonly JwtSecurityTokenHandler TokenHandler = new();

    private readonly JwtSettings _settings;
    private readonly TimeProvider _timeProvider;

    public JwtService(IOptions<JwtSettings> settings, TimeProvider timeProvider)
    {
      _settings = settings.Value;
      _timeProvider = timeProvider;
    }

    public AccessTokenResult GenerateToken(UserEntity user, Guid sessionId)
    {
      var now = _timeProvider.GetUtcNow();
      var expiresAt = now.AddMinutes(_settings.AccessTokenMinutes);

      var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.SecretKey))
      {
        KeyId = "coffee-filter"
      };

      var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

      var claims = new[]
      {
        new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString(CultureInfo.InvariantCulture)),
        new Claim(JwtRegisteredClaimNames.Name, user.Username),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N")),
        new Claim(AuthClaimTypes.SessionId, sessionId.ToString("N")),
        new Claim(
          JwtRegisteredClaimNames.Iat,
          now.ToUnixTimeSeconds().ToString(CultureInfo.InvariantCulture),
          ClaimValueTypes.Integer64)
      };

      var token = new JwtSecurityToken(
        issuer: _settings.Issuer,
        audience: _settings.Audience,
        claims: claims,
        notBefore: now.UtcDateTime,
        expires: expiresAt.UtcDateTime,
        signingCredentials: credentials);

      return new AccessTokenResult(TokenHandler.WriteToken(token), expiresAt.UtcDateTime);
    }
  }
}
