namespace Api.Database.Entities
{
  public class GrinderModelEntity : AuditableEntity
  {
    public int Id { get; set; }
    public required string Manufacturer { get; set; }
    public required string ModelName { get; set; }
    public required GrinderStyle Style { get; set; }
    public double GrindSettingMin { get; set; }
    public double GrindSettingMax { get; set; }
    public int GrindSettingResolution { get; set; }

    public ICollection<UserGrinderEntity> UserGrinders { get; set; } = [];
  }
}
