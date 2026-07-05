using Api.Database.Entities;
using Api.Features.CoffeeBags;

namespace Api.Features.Brews
{
  public class Brew
  {
    public int Id { get; init; }
    public User User { get; init; }
    public CoffeeBag CoffeeBag { get; init; }
    public int BrewMethodId { get; init; }
    public string BrewMethodName { get; init; }
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
      if (brewEntity.BrewMethod == null)
        throw new ArgumentException("BrewEntity.BrewMethod must be loaded");
      
      Id = brewEntity.Id;
      User = new User(brewEntity.User);
      CoffeeBag = new CoffeeBag(brewEntity.CoffeeBag);
      BrewMethodId = brewEntity.BrewMethodId;
      BrewMethodName = brewEntity.BrewMethod.Name;
      CoffeeDose = brewEntity.CoffeeDose;
      GrindSize = brewEntity.GrindSize;
      BrewTime = brewEntity.BrewTime;
      BrewWeight = brewEntity.BrewWeight;
      BrewTasteScore = brewEntity.BrewTasteScore;
      Notes = brewEntity.Notes;
    }
  }
}