namespace Api.Database.Entities
{
  using Api.Database;

  public class UserEntity : AuditableEntity
  {
    public int Id {get;set;}
    public required string Username {get;set;}
    public required string Email {get;set;}
    public string? DisplayName {get;set;}
    public required string PasswordHash {get;set;}
    public bool IsActive {get;set;} = true;
    public DateTime? LastLoginAt {get;set;}
  
    // Navigation properties
    public ICollection<CoffeeBagEntity> CoffeeBags {get;set;} = [];
    public ICollection<BrewEntity> Brews {get;set;} = [];
 
  }
}