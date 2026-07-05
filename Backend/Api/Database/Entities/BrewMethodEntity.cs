namespace Api.Database.Entities
{
  public class BrewMethodEntity : AuditableEntity
  {
    public int Id { get; set; }
    public required string Name { get; set; }
    public double DoseMax { get; set; }
    public double DoseMin { get; set; }
    public double DoseDefault { get; set; }
    public double GrindSizeMax { get; set; }
    public double GrindSizeMin { get; set; }
    public double GrindSizeDefault { get; set; }
    public int BrewTimeMax { get; set; }
    public int BrewTimeMin { get; set; }
    public int BrewTimeDefault { get; set; }
    public double BrewWeightMax { get; set; }
    public double BrewWeightMin { get; set; }
    public double BrewWeightDefault { get; set; }
  }
}
