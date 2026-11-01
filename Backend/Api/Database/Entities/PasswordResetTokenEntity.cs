namespace Api.Database.Entities
{
  public class PasswordResetTokenEntity
  {
    public long Id { get; set; }
    public int UserId { get; set; }
    public UserEntity User { get; set; } = null!;

    public required string TokenHash { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CreatedByIp { get; set; }
  }
}
