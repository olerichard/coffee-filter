namespace Api.Core.Auth
{
  using Microsoft.IdentityModel.Tokens;
  using System.Security.Cryptography;
  using System.Text;

  public static class RefreshTokenHasher
  {
    public static string Generate()
    {
      return Base64UrlEncoder.Encode(RandomNumberGenerator.GetBytes(32));
    }

    public static string Hash(string rawToken)
    {
      var bytes = Encoding.UTF8.GetBytes(rawToken);
      return Base64UrlEncoder.Encode(SHA256.HashData(bytes));
    }
  }
}
