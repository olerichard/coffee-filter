using Api.Database.Entities;
using Api.Features.Brewing.CoffeeBags;

namespace Api.Features.Brewing.Brews
{
  public class Brew
  {
    public int Id { get; init; }
    public User User { get; init; }
    public CoffeeBag CoffeeBag { get; init; }
    public string BrewType { get; init; }
    public double? CoffeeDose { get; init; }
    public double? GrindSize { get; init; }
    public int? BrewTime { get; init; }
    public double? BrewWeight { get; init; }
    public int? BrewTasteScore { get; init; }
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
      BrewTime = brewEntity.BrewTime;
      BrewWeight = brewEntity.BrewWeight;
      BrewTasteScore = brewEntity.BrewTasteScore;
      Notes = brewEntity.Notes;
    }
  }
}