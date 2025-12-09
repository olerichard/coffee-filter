using Api.Database;

namespace Api.Features.Brewing
{
  public class CoffeeBag : AuditableEntity
  {
    public int Id {get;set;}
    public required string Roaster {get;set;}
    public required string Origin {get;set;}
    public required string RoastStyle {get;set;}
    public string? FlavourNotes {get;set;}

    public DateTime? Opened {get;set;}
    public DateTime? Emptied {get;set;}

  }
}