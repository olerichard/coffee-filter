namespace Api.Database.Entities
{
  using Api.Database;

  public class BrewEntity : AuditableEntity
  {
    public int Id {get;set;}
    public required int UserId {get;set;}
    public UserEntity User {get;set;} = null!;
    public required int CoffeeBagId {get;set;}
    public CoffeeBagEntity CoffeeBag {get;set;} = null!;
    public required string BrewType {get;set;}
    public double? CoffeeDose {get;set;}
    public double? GrindSize {get;set;}
    public int? BrewTime {get;set;}
    public double? BrewWeight {get;set;}
    public int? BrewTasteScore {get;set;}
    public double? BrewAddedWeight {get;set;}
    public int? BrewAddedWeightTasteScore {get;set;}
    public string? Notes {get;set;}
  }

}
