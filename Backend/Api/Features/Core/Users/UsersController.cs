namespace Api.Features.Core.Users
{
  using Api.Database;
  using Api.Features.Core.Auth;
  using Microsoft.AspNetCore.Authorization;
  using Microsoft.AspNetCore.Mvc;


  [ApiController]
  [Route("api/[controller]")]
  [Authorize]
  public class UsersController : BaseController
  {
    private readonly AppDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public UsersController(AppDbContext dbContext, ICurrentUserService currentUserService)
    {
      _dbContext = dbContext;
      _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<IActionResult> GetCurrentUser()
    {
      var userId = _currentUserService.GetCurrentUserId();
      if (!userId.HasValue)
      {
        return Unauthorized();
      }

      var user = await _dbContext.Users.FindAsync(userId.Value);
      if (user == null)
      {
        return NotFound();
      }

      var userDto = new UserDto
      {
        Id = user.Id,
        Username = user.Username,
        Email = user.Email,
        DisplayName = user.DisplayName,
        IsActive = user.IsActive,
        LastLoginAt = user.LastLoginAt
      };

      return Ok(userDto);
    }
  }
}