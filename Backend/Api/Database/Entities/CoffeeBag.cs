namespace Api.Database.Entities
{
  using Api.Database;

  public class CoffeeBag : AuditableEntity
  {
    public int Id {get;set;}
    public required int UserId {get;set;}
    public User User {get;set;} = null!;
    public required string Roaster {get;set;}
    public required string Origin {get;set;}
    public required string RoastStyle {get;set;}
    public string? FlavourNotes {get;set;}
    public DateTime? Opened {get;set;}
    public DateTime? Emptied {get;set;}
    
    // Navigation property for brews
    public ICollection<Brew> Brews {get;set;} = [];
  }
}