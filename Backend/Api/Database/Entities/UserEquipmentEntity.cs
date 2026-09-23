namespace Api.Database.Entities
{
  public class UserEquipmentEntity : AuditableEntity
  {
    public int Id { get; set; }
    public required int UserId { get; set; }
    public UserEntity User { get; set; } = null!;
    public required int GrinderModelId { get; set; }
    public GrinderModelEntity GrinderModel { get; set; } = null!;
  }
}
