namespace Api.Features.Brewing.Brews
{
  using Api.Database.Entities;
  public class Brew
  {
    public int Id { get; init; }
    public User User { get; init; }
    public CoffeeBag CoffeeBag { get; init; }
    public string BrewType { get; init; }
    public double? CoffeeDose { get; init; }
    public double? GrindSize { get; init; }
    public int? OutputTime { get; init; }
    public double? OutputWeight { get; init; }
    public int? OutputTasteScore { get; init; }
    public double? OutputAddedWeight { get; init; }
    public int? OutputAddedTasteScore { get; init; }
    public string? Notes { get; init; }

    public Brew(BrewEntity brewEntity)
    {
      if (brewEntity.User == null)
        throw new ArgumentException("BrewEntity.User must be loaded");
      if (brewEntity.CoffeeBag == null)
        throw new ArgumentException("BrewEntity.CoffeeBag must be loaded");
        
      Id = brewEntity.Id;
      User = new User(brewEntity.User);
      CoffeeBag = new CoffeeBag(brewEntity.CoffeeBag);
      BrewType = brewEntity.BrewType;
      CoffeeDose = brewEntity.CoffeeDose;
      GrindSize = brewEntity.GrindSize;
      OutputTime = brewEntity.OutputTime;
      OutputWeight = brewEntity.OutputWeight;
      OutputTasteScore = brewEntity.OutputTasteScore;
      OutputAddedWeight = brewEntity.OutputAddedWeight;
      OutputAddedTasteScore = brewEntity.OutputAddedTasteScore;
      Notes = brewEntity.Notes;
    }
  }
}