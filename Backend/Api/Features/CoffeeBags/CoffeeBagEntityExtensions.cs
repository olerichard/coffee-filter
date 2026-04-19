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
    entity.Roaster = request.Roaster;
    entity.Origin = request.Origin;
    entity.RoastStyle = request.RoastStyle;
    entity.FlavourNotes = request.FlavourNotes;
    entity.Opened = request.Opened;
    entity.Emptied = request.Emptied;
  }
}