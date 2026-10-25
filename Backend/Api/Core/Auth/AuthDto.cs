namespace Api.Core.Auth
{
  using FluentValidation;

  public class LoginRequest
  {
    public required string Email { get; set; }
    public required string Password { get; set; }
  }

  public class LoginRequestValidator : AbstractValidator<LoginRequest>
  {
    public LoginRequestValidator()
    {
      RuleFor(x => x.Email)
        .NotEmpty()
        .EmailAddress()
        .MaximumLength(254);

      RuleFor(x => x.Password)
        .NotEmpty()
        .MinimumLength(6)
        .MaximumLength(128);
    }
  }

  public class RegisterRequest
  {
    public required string Email { get; set; }
    public required string Password { get; set; }
    public required string DisplayName { get; set; }
    public required string InviteCode { get; set; }
  }

  public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
  {
    public RegisterRequestValidator()
    {
      RuleFor(x => x.Email)
        .NotEmpty()
        .EmailAddress()
        .MaximumLength(254);

      RuleFor(x => x.Password)
        .NotEmpty()
        .MinimumLength(12)
        .MaximumLength(128);

      RuleFor(x => x.DisplayName)
        .NotEmpty()
        .MaximumLength(100);

      RuleFor(x => x.InviteCode)
        .NotEmpty()
        .MaximumLength(512);
    }
  }

  public class SignupStatusResponse
  {
    public bool Enabled { get; set; }
  }

  public class AuthResponse
  {
    public required string AccessToken { get; set; }
    public required DateTime ExpiresAt { get; set; }
    public required UserDto User { get; set; }
  }

  public class ChangePasswordRequest
  {
    public required string CurrentPassword { get; set; }
    public required string NewPassword { get; set; }
  }

  public class ChangePasswordRequestValidator : AbstractValidator<ChangePasswordRequest>
  {
    public ChangePasswordRequestValidator()
    {
      RuleFor(x => x.CurrentPassword)
        .NotEmpty()
        .MaximumLength(128);

      RuleFor(x => x.NewPassword)
        .NotEmpty()
        .MinimumLength(12)
        .MaximumLength(128)
        .NotEqual(x => x.CurrentPassword)
        .WithMessage("The new password must be different from the current password.");
    }
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
