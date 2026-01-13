namespace Api.Features.Core.Auth
{
  using FluentValidation;

  public class LoginRequest
  {
    public required string Username { get; set; }
    public required string Password { get; set; }
  }

  public class LoginRequestValidator : AbstractValidator<LoginRequest>
  {
    public LoginRequestValidator()
    {
      RuleFor(x => x.Username)
        .NotEmpty()
        .MinimumLength(3)
        .MaximumLength(50);

      RuleFor(x => x.Password)
        .NotEmpty()
        .MinimumLength(6);
    }
  }

  public class LoginResponse
  {
    public required string Token { get; set; }
    public required string Username { get; set; }
    public required string Email { get; set; }
    public string? DisplayName { get; set; }
  }

  public class UserDto
  {
    public required int Id { get; set; }
    public required string Username { get; set; }
    public required string Email { get; set; }
    public string? DisplayName { get; set; }
    public bool IsActive { get; set; }
    public DateTime? LastLoginAt { get; set; }
  }
}