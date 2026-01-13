namespace Api.Features.Auth
{
  using Api.Database;
  using Api.Database.Entities;
  using Api.Features.Core;
  using FluentValidation.AspNetCore;
  using Microsoft.AspNetCore.Authorization;
  using Microsoft.AspNetCore.Identity;
  using Microsoft.AspNetCore.Mvc;
  using Microsoft.EntityFrameworkCore;

  [ApiController]
  [Route("api/[controller]")]
  public class AuthController : BaseController
  {
    private readonly AppDbContext _dbContext;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly IJwtService _jwtService;

    public AuthController(AppDbContext dbContext, IPasswordHasher<User> passwordHasher, IJwtService jwtService)
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

      var user = await _dbContext.Users
        .FirstOrDefaultAsync(u => u.Username == request.Username);

      if (user == null)
      {
        return Unauthorized("Invalid username or password");
      }

      var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
      if ( result != PasswordVerificationResult.Success )
      {
        return Unauthorized("Invalid username or password");
      }

      // Update last login time
      user.LastLoginAt = DateTime.UtcNow;
      await _dbContext.SaveChangesAsync();

      var token = _jwtService.GenerateToken(user);

      var response = new LoginResponse
      {
        Token = token,
        Username = user.Username,
        Email = user.Email,
        DisplayName = user.DisplayName
      };

      return Ok(response);
    }
  }
}