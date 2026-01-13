using Api.Database.Entities;

public class CoffeeBag
{
  public int Id { get; init; }
  public string Roaster { get; init; }
  public string Origin { get; init; } 
  public string RoastStyle { get; init; }
  public string? FlavourNotes { get; init; }
  public DateTime? Opened { get; init; }
  public DateTime? Emptied { get; init; }

  public CoffeeBag(CoffeeBagEntity coffeeBagEntity)
  {
    if (coffeeBagEntity == null)
      throw new ArgumentException("CoffeeBagEntity cannot be null");
    if (coffeeBagEntity.Id <= 0)
      throw new ArgumentException("CoffeeBagEntity.Id must be greater than 0");
    if (string.IsNullOrWhiteSpace(coffeeBagEntity.Roaster))
      throw new ArgumentException("CoffeeBagEntity.Roaster cannot be null or empty");
    if (string.IsNullOrWhiteSpace(coffeeBagEntity.Origin))
      throw new ArgumentException("CoffeeBagEntity.Origin cannot be null or empty");
    if (string.IsNullOrWhiteSpace(coffeeBagEntity.RoastStyle))
      throw new ArgumentException("CoffeeBagEntity.RoastStyle cannot be null or empty");

    Id = coffeeBagEntity.Id;
    Roaster = coffeeBagEntity.Roaster;
    Origin = coffeeBagEntity.Origin;
    RoastStyle = coffeeBagEntity.RoastStyle;
    FlavourNotes = coffeeBagEntity.FlavourNotes;
    Opened = coffeeBagEntity.Opened;
    Emptied = coffeeBagEntity.Emptied;
  }
}