using Api.Database;
using Api.Features.Brewing;

namespace Api.Database.Entities
{
  public class Brew : AuditableEntity
  {
    public int Id {get;set;}
    public required int CoffeeBagId {get;set;}

    public CoffeeBag CoffeeBag {get;set;} = null!;

    public required string BrewType {get;set;}

    public double? CoffeeDose {get;set;}

    public double? GrindSize {get;set;}
    public int? OutputTime {get;set;}

    public double? OutputWeight {get;set;}
    public int? OutputTasteScore {get;set;}

    public double? OutputAddedWeight {get;set;}
    public int? OutputAddedTasteScore {get;set;}

    public string? Notes {get;set;}

  }
}
