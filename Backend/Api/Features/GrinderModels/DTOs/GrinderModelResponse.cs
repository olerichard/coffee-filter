namespace Api.Features.GrinderModels.DTOs;

using Api.Database.Entities;

public record GrinderSetting
{
  public double Min { get; set; }
  public double Max { get; set; }
  public int Resolution { get; set; }
}

public record GrinderModelResponse
{
  public int Id { get; set; }
  public string Manufacturer { get; set; } = "";
  public string ModelName { get; set; } = "";
  public GrinderStyle Style { get; set; }
  public GrinderSetting GrindSetting { get; set; } = null!;
}
