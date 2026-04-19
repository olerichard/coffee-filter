namespace Api.Features.Brewing.Brews;

using Api.Database.Entities;
using Api.Features.Brewing.Brews.DTOs;
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

  public static BrewEntity ToBrew(this CreateBrewRequest createBrewRequest, int userId)
  {
    return new BrewEntity
      {
        UserId = userId,
        CoffeeBagId = createBrewRequest.CoffeeBagId,
        BrewType = createBrewRequest.BrewType,
        CoffeeDose = createBrewRequest.CoffeeDose,
        GrindSize = createBrewRequest.GrindSize,
        BrewTime = createBrewRequest.BrewTime,
        BrewWeight = createBrewRequest.BrewWeight,
        BrewTasteScore = createBrewRequest.BrewTasteScore,
        Notes = createBrewRequest.Notes,
      };
  }

  public static void UpdateBrew(this BrewEntity brew, UpdateBrewRequest request)
  {
    if (request.CoffeeBagId.HasValue)
      brew.CoffeeBagId = request.CoffeeBagId.Value;
    if (request.BrewType != null)
      brew.BrewType = request.BrewType;
    if (request.CoffeeDose.HasValue)
      brew.CoffeeDose = request.CoffeeDose.Value;
    if (request.GrindSize.HasValue)
      brew.GrindSize = request.GrindSize.Value;
    if (request.BrewTime.HasValue)
      brew.BrewTime = request.BrewTime.Value;
    if (request.BrewWeight.HasValue)
      brew.BrewWeight = request.BrewWeight.Value;
    if (request.BrewTasteScore.HasValue)
      brew.BrewTasteScore = request.BrewTasteScore.Value;
    if (request.Notes != null)
      brew.Notes = request.Notes;
  }

}