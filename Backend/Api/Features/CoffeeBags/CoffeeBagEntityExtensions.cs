namespace Api.Features.CoffeeBags;

using Api.Database.Entities;
using Api.Features.CoffeeBags.DTOs;

public static class CoffeeBagEntityExtensions
{
  public static CoffeeBagResponse ToCoffeeBagResponse(this CoffeeBagEntity entity)
  {
    return new CoffeeBagResponse
    {
      Id = entity.Id,
      UserId = entity.UserId,
      Roaster = entity.Roaster,
      Origin = entity.Origin,
      RoastStyle = entity.RoastStyle,
      FlavourNotes = entity.FlavourNotes,
      Opened = entity.Opened,
      Emptied = entity.Emptied,
    };
  }

  public static CoffeeBagEntity ToCoffeeBagEntity(this CreateCoffeeBagRequest request, int userId)
  {
    return new CoffeeBagEntity
    {
      UserId = userId,
      Roaster = request.Roaster,
      Origin = request.Origin,
      RoastStyle = request.RoastStyle,
      FlavourNotes = request.FlavourNotes,
      Opened = request.Opened,
      Emptied = request.Emptied,
    };
  }

  public static void UpdateCoffeeBagEntity(this CoffeeBagEntity entity, UpdateCoffeeBagRequest request)
  {
    if (request.Roaster is not null)
      entity.Roaster = request.Roaster;
    if (request.Origin is not null)
      entity.Origin = request.Origin;
    if (request.RoastStyle is not null)
      entity.RoastStyle = request.RoastStyle;
    if (request.FlavourNotes is not null)
      entity.FlavourNotes = request.FlavourNotes;
    if (request.Opened is not null)
      entity.Opened = request.Opened;
    if (request.Emptied is not null)
      entity.Emptied = request.Emptied;
  }
}