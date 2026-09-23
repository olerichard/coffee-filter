namespace Api.Features.UserEquipment;

using Api.Database.Entities;
using Api.Features.GrinderModels;
using Api.Features.UserEquipment.DTOs;

public static class UserEquipmentEntityExtensions
{
  public static UserEquipmentResponse ToUserEquipmentResponse(this UserEquipmentEntity entity)
  {
    return new UserEquipmentResponse
    {
      Id = entity.Id,
      GrinderModel = entity.GrinderModel.ToGrinderModelResponse(),
    };
  }

  public static UserEquipmentEntity ToUserEquipmentEntity(this CreateUserEquipmentRequest request, int userId, string userName)
  {
    return new UserEquipmentEntity
    {
      UserId = userId,
      GrinderModelId = request.GrinderModelId,
      CreatedBy = userName,
      CreatedOn = DateTime.UtcNow,
    };
  }
}
