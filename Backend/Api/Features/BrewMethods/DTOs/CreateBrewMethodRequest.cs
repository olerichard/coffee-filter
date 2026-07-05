namespace Api.Features.BrewMethods.DTOs
{
  using FluentValidation;

  public record CreateBrewMethodRequest
  {
    public required string Name { get; set; }
    public required BrewMethodDoubleSetting Dose { get; set; }
    public required BrewMethodDoubleSetting GrindSize { get; set; }
    public required BrewMethodIntSetting BrewTime { get; set; }
    public required BrewMethodDoubleSetting BrewWeight { get; set; }
  }

  public class CreateBrewMethodRequestValidator : AbstractValidator<CreateBrewMethodRequest>
  {
    public CreateBrewMethodRequestValidator()
    {
      RuleFor(x => x.Name)
        .NotEmpty()
        .WithMessage("Name is required")
        .MaximumLength(100)
        .WithMessage("Name must not exceed 100 characters");

      RuleFor(x => x.Dose)
        .NotNull()
        .WithMessage("Dose is required");
      RuleFor(x => x.Dose.Min).GreaterThanOrEqualTo(0).WithMessage("Dose.Min must be greater than or equal to 0");
      RuleFor(x => x.Dose.Max).GreaterThanOrEqualTo(0).WithMessage("Dose.Max must be greater than or equal to 0");
      RuleFor(x => x.Dose.Default).GreaterThanOrEqualTo(0).WithMessage("Dose.Default must be greater than or equal to 0");

      RuleFor(x => x.GrindSize)
        .NotNull()
        .WithMessage("GrindSize is required");
      RuleFor(x => x.GrindSize.Min).GreaterThanOrEqualTo(0).WithMessage("GrindSize.Min must be greater than or equal to 0");
      RuleFor(x => x.GrindSize.Max).GreaterThanOrEqualTo(0).WithMessage("GrindSize.Max must be greater than or equal to 0");
      RuleFor(x => x.GrindSize.Default).GreaterThanOrEqualTo(0).WithMessage("GrindSize.Default must be greater than or equal to 0");

      RuleFor(x => x.BrewTime)
        .NotNull()
        .WithMessage("BrewTime is required");
      RuleFor(x => x.BrewTime.Min).GreaterThanOrEqualTo(0).WithMessage("BrewTime.Min must be greater than or equal to 0");
      RuleFor(x => x.BrewTime.Max).GreaterThanOrEqualTo(0).WithMessage("BrewTime.Max must be greater than or equal to 0");
      RuleFor(x => x.BrewTime.Default).GreaterThanOrEqualTo(0).WithMessage("BrewTime.Default must be greater than or equal to 0");

      RuleFor(x => x.BrewWeight)
        .NotNull()
        .WithMessage("BrewWeight is required");
      RuleFor(x => x.BrewWeight.Min).GreaterThanOrEqualTo(0).WithMessage("BrewWeight.Min must be greater than or equal to 0");
      RuleFor(x => x.BrewWeight.Max).GreaterThanOrEqualTo(0).WithMessage("BrewWeight.Max must be greater than or equal to 0");
      RuleFor(x => x.BrewWeight.Default).GreaterThanOrEqualTo(0).WithMessage("BrewWeight.Default must be greater than or equal to 0");
    }
  }
}
