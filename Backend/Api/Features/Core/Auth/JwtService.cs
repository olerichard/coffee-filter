namespace Api.Features.Core.Auth
{
  using Api.Database.Entities;
  using Microsoft.IdentityModel.Tokens;
  using System.IdentityModel.Tokens.Jwt;
  using System.Security.Claims;
  using System.Text;

  public interface IJwtService
  {
    string GenerateToken(UserEntity user);
  }

  public class JwtService : IJwtService
  {
    private readonly IConfiguration _configuration;

    public JwtService(IConfiguration configuration)
    {
      _configuration = configuration;
    }

    public string GenerateToken(UserEntity user)
    {
      var jwtSettings = _configuration.GetSection("JwtSettings");
      var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");
      var issuer = jwtSettings["Issuer"] ?? "CoffeeFilter";
      var audience = jwtSettings["Audience"] ?? "CoffeeFilterUsers";

      var secretKeyBytes = Encoding.UTF8.GetBytes(secretKey);
      var keyFingerprint = Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(secretKeyBytes));
      Console.WriteLine($"JWT signing key fingerprint (SHA256): {keyFingerprint}");
      Console.WriteLine($"JWT issuer: {issuer}");
      Console.WriteLine($"JWT audience: {audience}");

      var key = new SymmetricSecurityKey(secretKeyBytes);
      var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

      var claims = new[]
      {
        new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
        new Claim(JwtRegisteredClaimNames.Name, user.Username),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
      };

      var token = new JwtSecurityToken(
        issuer: issuer,
        audience: audience,
        claims: claims,
        expires: DateTime.UtcNow.AddDays(7),
        signingCredentials: credentials
      );

      return new JwtSecurityTokenHandler().WriteToken(token);
    }
  }
}