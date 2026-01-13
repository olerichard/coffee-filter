namespace Api.Features.Core
{
  using Api.Database;
  using Api.Database.Entities;
  using Api.Features.Auth;
  using Microsoft.AspNetCore.Authorization;
  using Microsoft.AspNetCore.Mvc;
  using Microsoft.EntityFrameworkCore;

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

    [HttpGet]
    public async Task<IActionResult> GetAllUsers()
    {
      var users = await _dbContext.Users
        .Select(u => new UserDto
        {
          Id = u.Id,
          Username = u.Username,
          Email = u.Email,
          DisplayName = u.DisplayName,
          IsActive = u.IsActive,
          LastLoginAt = u.LastLoginAt
        })
        .ToListAsync();

      return Ok(users);
    }
  }
}