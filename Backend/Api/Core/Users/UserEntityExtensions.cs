namespace Api.Core.Users
{
  using Api.Core.Auth;
  using Api.Database.Entities;

  public static class UserEntityExtensions
  {
    public static UserDto ToUserDto(this UserEntity user)
    {
      return new UserDto
      {
        Id = user.Id,
        Username = user.Username,
        Email = user.Email,
        DisplayName = user.DisplayName,
        IsActive = user.IsActive,
        LastLoginAt = user.LastLoginAt
      };
    }
  }
}
