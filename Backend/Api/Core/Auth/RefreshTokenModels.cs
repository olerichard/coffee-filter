namespace Api.Core.Auth
{
  using Api.Database.Entities;

  public sealed record RefreshTokenCreationResult(
    string RawToken,
    DateTime ExpiresAt);

  public sealed record RefreshTokenRotationResult(
    string RawToken,
    DateTime ExpiresAt,
    UserEntity User);
}
