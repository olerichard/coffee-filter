namespace Api.Features.GrinderModels;

using Api.Database.Entities;
using Api.Features.GrinderModels.DTOs;

public static class GrinderModelEntityExtensions
{
  public static GrinderModelResponse ToGrinderModelResponse(this GrinderModelEntity entity)
  {
    return new GrinderModelResponse
    {
      Id = entity.Id,
      Manufacturer = entity.Manufacturer,
      ModelName = entity.ModelName,
      Style = entity.Style,
      GrindSetting = new GrinderSetting
      {
        Min = entity.GrindSettingMin,
        Max = entity.GrindSettingMax,
        Resolution = entity.GrindSettingResolution,
      },
    };
  }

  public static GrinderModelEntity ToGrinderModelEntity(this CreateGrinderModelRequest request, string userName)
  {
    return new GrinderModelEntity
    {
      Manufacturer = request.Manufacturer,
      ModelName = request.ModelName,
      Style = request.Style,
      GrindSettingMin = request.GrindSetting.Min,
      GrindSettingMax = request.GrindSetting.Max,
      GrindSettingResolution = request.GrindSetting.Resolution,
      CreatedBy = userName,
      CreatedOn = DateTime.UtcNow,
    };
  }

  public static void UpdateGrinderModelEntity(this GrinderModelEntity entity, UpdateGrinderModelRequest request, string userName)
  {
    if (request.Manufacturer is not null)
      entity.Manufacturer = request.Manufacturer;
    if (request.ModelName is not null)
      entity.ModelName = request.ModelName;
    if (request.Style is not null)
      entity.Style = request.Style.Value;
    if (request.GrindSetting is not null)
    {
      entity.GrindSettingMin = request.GrindSetting.Min;
      entity.GrindSettingMax = request.GrindSetting.Max;
      entity.GrindSettingResolution = request.GrindSetting.Resolution;
    }

    entity.LastModifiedBy = userName;
    entity.LastModifiedOn = DateTime.UtcNow;
  }
}
