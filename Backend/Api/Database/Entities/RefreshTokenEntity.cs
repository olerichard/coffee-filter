namespace Api.Database.Entities
{
  public class RefreshTokenEntity
  {
    public long Id { get; set; }
    public int UserId { get; set; }
    public UserEntity User { get; set; } = null!;

    public required string TokenHash { get; set; }
    public Guid FamilyId { get; set; }
    public DateTime FamilyExpiresAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }

    public DateTime? RevokedAt { get; set; }
    public string? RevokedReason { get; set; }
    public string? ReplacedByTokenHash { get; set; }

    public string? CreatedByIp { get; set; }
    public string? UserAgent { get; set; }
  }
}
