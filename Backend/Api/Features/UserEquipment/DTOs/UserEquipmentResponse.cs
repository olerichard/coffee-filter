namespace Api.Features.UserEquipment.DTOs;

using Api.Features.GrinderModels.DTOs;

public record UserEquipmentResponse
{
  public int Id { get; set; }
  public GrinderModelResponse GrinderModel { get; set; } = null!;
}
