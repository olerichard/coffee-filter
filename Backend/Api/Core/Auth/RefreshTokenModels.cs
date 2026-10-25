namespace Api.Core.Auth
{
  using Api.Database.Entities;

  public static class RefreshTokenRevocationReasons
  {
    public const string Rotated = "Rotated";
    public const string Login = "Login";
    public const string Logout = "Logout";
    public const string LogoutAll = "LogoutAll";
    public const string ReuseDetected = "ReuseDetected";
    public const string PasswordChanged = "PasswordChanged";
    public const string SessionRevoked = "SessionRevoked";
    public const string InactiveUser = "InactiveUser";
  }

  public enum RefreshTokenRotationStatus
  {
    Success,
    Invalid,
    Expired,
    ReusedGrace,
    Reused,
    InactiveUser
  }

  public sealed record RefreshTokenCreationResult(
    string RawToken,
    DateTime ExpiresAt,
    Guid FamilyId);

  public sealed record RefreshTokenRotationResult(
    RefreshTokenRotationStatus Status,
    string? RawToken = null,
    DateTime? ExpiresAt = null,
    UserEntity? User = null,
    Guid? FamilyId = null);

  public sealed record SessionSummary(
    Guid Id,
    DateTime CreatedAt,
    DateTime LastUsedAt,
    DateTime ExpiresAt,
    string? IpAddress,
    string? UserAgent,
    bool IsCurrent);
}
