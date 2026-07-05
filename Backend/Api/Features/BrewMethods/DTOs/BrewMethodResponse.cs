namespace Api.Features.BrewMethods.DTOs;

public record BrewMethodDoubleSetting
{
  public double Min { get; set; }
  public double Max { get; set; }
  public double Default { get; set; }
}

public record BrewMethodIntSetting
{
  public int Min { get; set; }
  public int Max { get; set; }
  public int Default { get; set; }
}

public record BrewMethodResponse
{
  public int Id { get; set; }
  public string Name { get; set; } = "";
  public BrewMethodDoubleSetting Dose { get; set; } = null!;
  public BrewMethodDoubleSetting GrindSize { get; set; } = null!;
  public BrewMethodIntSetting BrewTime { get; set; } = null!;
  public BrewMethodDoubleSetting BrewWeight { get; set; } = null!;
}
