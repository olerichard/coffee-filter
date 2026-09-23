namespace Api.Features.GrinderModels.DTOs
{
  using Api.Database.Entities;
  using FluentValidation;

  public record UpdateGrinderModelRequest
  {
    public string? Manufacturer { get; set; }
    public string? ModelName { get; set; }
    public GrinderStyle? Style { get; set; }
    public GrinderSetting? GrindSetting { get; set; }
  }

  public class UpdateGrinderModelRequestValidator : AbstractValidator<UpdateGrinderModelRequest>
  {
    public UpdateGrinderModelRequestValidator()
    {
      RuleFor(x => x.Manufacturer)
        .NotEmpty()
        .WithMessage("Manufacturer is required")
        .MaximumLength(100)
        .WithMessage("Manufacturer must not exceed 100 characters")
        .When(x => x.Manufacturer != null);

      RuleFor(x => x.ModelName)
        .NotEmpty()
        .WithMessage("ModelName is required")
        .MaximumLength(100)
        .WithMessage("ModelName must not exceed 100 characters")
        .When(x => x.ModelName != null);

      RuleFor(x => x.Style)
        .IsInEnum()
        .WithMessage("Style must be one of: espresso, filter, universal")
        .When(x => x.Style != null);

      When(x => x.GrindSetting != null, () =>
      {
        RuleFor(x => x.GrindSetting!.Min)
          .GreaterThanOrEqualTo(0)
          .WithMessage("GrindSetting.Min must be greater than or equal to 0");

        RuleFor(x => x.GrindSetting!.Max)
          .GreaterThan(x => x.GrindSetting!.Min)
          .WithMessage("GrindSetting.Max must be greater than GrindSetting.Min");

        RuleFor(x => x.GrindSetting!.Resolution)
          .InclusiveBetween(0, 6)
          .WithMessage("GrindSetting.Resolution must be between 0 and 6");
      });
    }
  }
}
