namespace Api.Core.Auth
{
  using Api.Database.Entities;

  public sealed record PasswordResetRequest(
    UserEntity User,
    string RawToken,
    DateTime ExpiresAt);
}
