namespace Api.Features.UserGrinders.DTOs;

using Api.Features.GrinderModels.DTOs;

public record UserGrinderResponse
{
  public int Id { get; set; }
  public GrinderModelResponse GrinderModel { get; set; } = null!;
}
