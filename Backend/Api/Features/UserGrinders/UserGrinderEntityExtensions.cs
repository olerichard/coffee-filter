namespace Api.Features.UserGrinders;

using Api.Database.Entities;
using Api.Features.GrinderModels;
using Api.Features.UserGrinders.DTOs;

public static class UserGrinderEntityExtensions
{
  public static UserGrinderResponse ToUserGrinderResponse(this UserGrinderEntity entity)
  {
    return new UserGrinderResponse
    {
      Id = entity.Id,
      GrinderModel = entity.GrinderModel.ToGrinderModelResponse(),
    };
  }

  public static UserGrinderEntity ToUserGrinderEntity(this CreateUserGrinderRequest request, int userId, string userName)
  {
    return new UserGrinderEntity
    {
      UserId = userId,
      GrinderModelId = request.GrinderModelId,
      CreatedBy = userName,
      CreatedOn = DateTime.UtcNow,
    };
  }
}
