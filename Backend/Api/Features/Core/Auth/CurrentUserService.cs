namespace Api.Features.Core.Auth
{
  using Microsoft.AspNetCore.Http;
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
      var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
      return userIdClaim != null ? int.Parse(userIdClaim.Value) : null;
    }

    public string? GetCurrentUserName()
    {
      return _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Name)?.Value;
    }

    public bool IsAuthenticated()
    {
      return _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;
    }
  }
}