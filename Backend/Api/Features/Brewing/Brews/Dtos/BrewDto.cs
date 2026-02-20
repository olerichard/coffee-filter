namespace Api.Features.Brewing.Brews.Dtos;

public class CoffeeBagDto
{
  public int Id { get; set; }
  public int UserId { get; set; }
  public string Roaster { get; set; } = "";
  public string Origin { get; set; } = "";
  public string RoastStyle { get; set; } = "";
  public string? FlavourNotes { get; set; }
  public DateTime? Opened { get; set; }
  public DateTime? Emptied { get; set; }
}

public class BrewDto
{
  public int Id { get; set; }
  public int CoffeeBagId { get; set; }
  public CoffeeBagDto CoffeeBag { get; set; } = null!;
  public string BrewType { get; set; } = "";
  public double CoffeeDose { get; set; }
  public double GrindSize { get; set; }
  public int BrewTime { get; set; }
  public double BrewWeight { get; set; }
  public int BrewTasteScore { get; set; }
  public double BrewAddedWeight { get; set; }
  public int BrewAddedTasteScore { get; set; }
  public string? Notes { get; set; }
  public DateTime BrewedOn { get; set; }
}
