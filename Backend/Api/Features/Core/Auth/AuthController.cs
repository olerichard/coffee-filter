namespace Api.Features.Core.Auth
{
  using Api.Database;
  using Api.Database.Entities;
  using Api.Features.Core;

  using Microsoft.AspNetCore.Identity;
  using Microsoft.AspNetCore.Mvc;
  using Microsoft.EntityFrameworkCore;

  [ApiController]
  [Route("api/[controller]")]
  public class AuthController : BaseController
  {
    private readonly AppDbContext _dbContext;
    private readonly IPasswordHasher<UserEntity> _passwordHasher;
    private readonly IJwtService _jwtService;

    public AuthController(AppDbContext dbContext, IPasswordHasher<UserEntity> passwordHasher, IJwtService jwtService)
    {
      _dbContext = dbContext;
      _passwordHasher = passwordHasher;
      _jwtService = jwtService;
    }

[HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, [FromServices] LoginRequestValidator validator)
    {
      var validationResult = await validator.ValidateAsync(request);
      if (!validationResult.IsValid)
      {
        return BadRequest(validationResult.Errors);
      }

      var userEntity = await _dbContext.Users
        .FirstOrDefaultAsync(u => u.Username == request.Username);

      if (userEntity == null)
      {
        return Unauthorized("Invalid username or password");
      }

      var result = _passwordHasher.VerifyHashedPassword(userEntity, userEntity.PasswordHash, request.Password);
      if ( result != PasswordVerificationResult.Success )
      {
        return Unauthorized("Invalid username or password");
      }

      // Update last login time
      userEntity.LastLoginAt = DateTime.UtcNow;
      await _dbContext.SaveChangesAsync();

      var token = _jwtService.GenerateToken(userEntity);

      var response = new LoginResponse
      {
        Token = token,
        Username = userEntity.Username,
        Email = userEntity.Email,
        DisplayName = userEntity.DisplayName
      };

      return Ok(response);
    }
  }
}