using Api.Database.Entities;

namespace Api.Features.BrewMethods
{
  public class BrewMethod
  {
    public int Id { get; init; }
    public string Name { get; init; }
    public double DoseMax { get; init; }
    public double DoseMin { get; init; }
    public double DoseDefault { get; init; }
    public double GrindSizeMax { get; init; }
    public double GrindSizeMin { get; init; }
    public double GrindSizeDefault { get; init; }
    public int BrewTimeMax { get; init; }
    public int BrewTimeMin { get; init; }
    public int BrewTimeDefault { get; init; }
    public double BrewWeightMax { get; init; }
    public double BrewWeightMin { get; init; }
    public double BrewWeightDefault { get; init; }

    public BrewMethod(BrewMethodEntity entity)
    {
      Id = entity.Id;
      Name = entity.Name;
      DoseMax = entity.DoseMax;
      DoseMin = entity.DoseMin;
      DoseDefault = entity.DoseDefault;
      GrindSizeMax = entity.GrindSizeMax;
      GrindSizeMin = entity.GrindSizeMin;
      GrindSizeDefault = entity.GrindSizeDefault;
      BrewTimeMax = entity.BrewTimeMax;
      BrewTimeMin = entity.BrewTimeMin;
      BrewTimeDefault = entity.BrewTimeDefault;
      BrewWeightMax = entity.BrewWeightMax;
      BrewWeightMin = entity.BrewWeightMin;
      BrewWeightDefault = entity.BrewWeightDefault;
    }
  }
}
