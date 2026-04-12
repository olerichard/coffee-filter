namespace Api.Features.Brewing.Brews;

using Api.Database.Entities;
using Api.Features.Brewing.DTOs;

public static class BrewEntityExtensions
{
  public static BrewResponse ToBrewResponse(this BrewEntity brew)
  {
    return new BrewResponse
    {
      Id = brew.Id,
      CoffeeBagId = brew.CoffeeBagId,
      CoffeeBag = new CoffeeBagResponse
      {
        Id = brew.CoffeeBag.Id,
        UserId = brew.CoffeeBag.UserId,
        Roaster = brew.CoffeeBag.Roaster,
        Origin = brew.CoffeeBag.Origin,
        RoastStyle = brew.CoffeeBag.RoastStyle,
        FlavourNotes = brew.CoffeeBag.FlavourNotes,
        Opened = brew.CoffeeBag.Opened,
        Emptied = brew.CoffeeBag.Emptied,
      },
      BrewType = brew.BrewType ?? "",
      CoffeeDose = brew.CoffeeDose ?? 0,
      GrindSize = brew.GrindSize ?? 0,
      BrewTime = brew.BrewTime ?? 0,
      BrewWeight = brew.BrewWeight ?? 0,
      BrewTasteScore = brew.BrewTasteScore ?? 0,
      Notes = brew.Notes,
      BrewedOn = brew.CreatedOn ?? DateTime.UtcNow,
    };
  }
}