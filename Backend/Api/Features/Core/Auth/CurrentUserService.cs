namespace Api.Features.Core.Auth
{
  using Microsoft.AspNetCore.Http;
  using System.IdentityModel.Tokens.Jwt;
  using System.Security.Claims;

  public interface ICurrentUserService
  {
    int? GetCurrentUserId();
    string? GetCurrentUserName();
    bool IsAuthenticated();
  }

  public class CurrentUserService : ICurrentUserService
  {
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
      _httpContextAccessor = httpContextAccessor;
    }

    public int? GetCurrentUserId()
    {
      var user = _httpContextAccessor.HttpContext?.User;
      if (user == null)
      {
        return null;
      }

      var userIdValue = user.FindFirstValue(JwtRegisteredClaimNames.Sub)
        ?? user.FindFirstValue(ClaimTypes.NameIdentifier);

      return int.TryParse(userIdValue, out var userId) ? userId : null;
    }

    public string? GetCurrentUserName()
    {
      var user = _httpContextAccessor.HttpContext?.User;
      if (user == null)
      {
        return null;
      }

      return user.FindFirstValue(JwtRegisteredClaimNames.Name)
        ?? user.FindFirstValue(ClaimTypes.Name);
    }

    public bool IsAuthenticated()
    {
      return _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;
    }
  }
}