namespace Api.Features.BrewMethods;

using Api.Database.Entities;
using Api.Features.BrewMethods.DTOs;

public static class BrewMethodEntityExtensions
{
  public static BrewMethodResponse ToBrewMethodResponse(this BrewMethodEntity method)
  {
    return new BrewMethodResponse
    {
      Id = method.Id,
      Name = method.Name,
      Dose = new BrewMethodDoubleSetting
      {
        Min = method.DoseMin,
        Max = method.DoseMax,
        Default = method.DoseDefault,
      },
      GrindSize = new BrewMethodDoubleSetting
      {
        Min = method.GrindSizeMin,
        Max = method.GrindSizeMax,
        Default = method.GrindSizeDefault,
      },
      BrewTime = new BrewMethodIntSetting
      {
        Min = method.BrewTimeMin,
        Max = method.BrewTimeMax,
        Default = method.BrewTimeDefault,
      },
      BrewWeight = new BrewMethodDoubleSetting
      {
        Min = method.BrewWeightMin,
        Max = method.BrewWeightMax,
        Default = method.BrewWeightDefault,
      },
    };
  }

  public static BrewMethodEntity ToBrewMethod(this CreateBrewMethodRequest request)
  {
    return new BrewMethodEntity
    {
      Name = request.Name,
      DoseMin = request.Dose.Min,
      DoseMax = request.Dose.Max,
      DoseDefault = request.Dose.Default,
      GrindSizeMin = request.GrindSize.Min,
      GrindSizeMax = request.GrindSize.Max,
      GrindSizeDefault = request.GrindSize.Default,
      BrewTimeMin = request.BrewTime.Min,
      BrewTimeMax = request.BrewTime.Max,
      BrewTimeDefault = request.BrewTime.Default,
      BrewWeightMin = request.BrewWeight.Min,
      BrewWeightMax = request.BrewWeight.Max,
      BrewWeightDefault = request.BrewWeight.Default,
    };
  }

  public static void UpdateBrewMethod(this BrewMethodEntity method, UpdateBrewMethodRequest request)
  {
    if (request.Name != null)
      method.Name = request.Name;
    if (request.Dose != null)
    {
      method.DoseMin = request.Dose.Min;
      method.DoseMax = request.Dose.Max;
      method.DoseDefault = request.Dose.Default;
    }
    if (request.GrindSize != null)
    {
      method.GrindSizeMin = request.GrindSize.Min;
      method.GrindSizeMax = request.GrindSize.Max;
      method.GrindSizeDefault = request.GrindSize.Default;
    }
    if (request.BrewTime != null)
    {
      method.BrewTimeMin = request.BrewTime.Min;
      method.BrewTimeMax = request.BrewTime.Max;
      method.BrewTimeDefault = request.BrewTime.Default;
    }
    if (request.BrewWeight != null)
    {
      method.BrewWeightMin = request.BrewWeight.Min;
      method.BrewWeightMax = request.BrewWeight.Max;
      method.BrewWeightDefault = request.BrewWeight.Default;
    }
  }
}
