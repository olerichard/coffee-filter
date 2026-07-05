namespace Api.Features.BrewMethods.DTOs
{
  using FluentValidation;

  public record UpdateBrewMethodRequest
  {
    public string? Name { get; set; }
    public BrewMethodDoubleSetting? Dose { get; set; }
    public BrewMethodDoubleSetting? GrindSize { get; set; }
    public BrewMethodIntSetting? BrewTime { get; set; }
    public BrewMethodDoubleSetting? BrewWeight { get; set; }
  }

  public class UpdateBrewMethodRequestValidator : AbstractValidator<UpdateBrewMethodRequest>
  {
    public UpdateBrewMethodRequestValidator()
    {
      RuleFor(x => x.Name)
        .NotEmpty()
        .When(x => x.Name != null)
        .WithMessage("Name is required")
        .MaximumLength(100)
        .When(x => x.Name != null)
        .WithMessage("Name must not exceed 100 characters");

      When(x => x.Dose != null, () =>
      {
        RuleFor(x => x.Dose!.Min).GreaterThanOrEqualTo(0).WithMessage("Dose.Min must be greater than or equal to 0");
        RuleFor(x => x.Dose!.Max).GreaterThanOrEqualTo(0).WithMessage("Dose.Max must be greater than or equal to 0");
        RuleFor(x => x.Dose!.Default).GreaterThanOrEqualTo(0).WithMessage("Dose.Default must be greater than or equal to 0");
      });

      When(x => x.GrindSize != null, () =>
      {
        RuleFor(x => x.GrindSize!.Min).GreaterThanOrEqualTo(0).WithMessage("GrindSize.Min must be greater than or equal to 0");
        RuleFor(x => x.GrindSize!.Max).GreaterThanOrEqualTo(0).WithMessage("GrindSize.Max must be greater than or equal to 0");
        RuleFor(x => x.GrindSize!.Default).GreaterThanOrEqualTo(0).WithMessage("GrindSize.Default must be greater than or equal to 0");
      });

      When(x => x.BrewTime != null, () =>
      {
        RuleFor(x => x.BrewTime!.Min).GreaterThanOrEqualTo(0).WithMessage("BrewTime.Min must be greater than or equal to 0");
        RuleFor(x => x.BrewTime!.Max).GreaterThanOrEqualTo(0).WithMessage("BrewTime.Max must be greater than or equal to 0");
        RuleFor(x => x.BrewTime!.Default).GreaterThanOrEqualTo(0).WithMessage("BrewTime.Default must be greater than or equal to 0");
      });

      When(x => x.BrewWeight != null, () =>
      {
        RuleFor(x => x.BrewWeight!.Min).GreaterThanOrEqualTo(0).WithMessage("BrewWeight.Min must be greater than or equal to 0");
        RuleFor(x => x.BrewWeight!.Max).GreaterThanOrEqualTo(0).WithMessage("BrewWeight.Max must be greater than or equal to 0");
        RuleFor(x => x.BrewWeight!.Default).GreaterThanOrEqualTo(0).WithMessage("BrewWeight.Default must be greater than or equal to 0");
      });
    }
  }
}
