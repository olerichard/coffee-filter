namespace Api.Features.CoffeeBags.DTOs;

using FluentValidation;

public class UpdateCoffeeBagRequest
{
  public string? Roaster { get; set; }
  public string? Name { get; set; }
  public string? Origin { get; set; }
  public string? RoastStyle { get; set; }
  public string? FlavourNotes { get; set; }
  public DateTime? Opened { get; set; }
  public DateTime? Emptied { get; set; }
}

public class UpdateCoffeeBagRequestValidator : AbstractValidator<UpdateCoffeeBagRequest>
{
  public UpdateCoffeeBagRequestValidator()
  {
    RuleFor(x => x.Roaster)
      .NotEmpty()
      .WithMessage("Roaster is required")
      .MaximumLength(100)
      .WithMessage("Roaster must not exceed 100 characters")
      .When(x => x.Roaster != null);

    RuleFor(x => x.Name)
      .MaximumLength(100)
      .When(x => x.Name != null)
      .WithMessage("Name must not exceed 100 characters");

    RuleFor(x => x.Origin)
      .NotEmpty()
      .WithMessage("Origin is required")
      .MaximumLength(100)
      .WithMessage("Origin must not exceed 100 characters")
      .When(x => x.Origin != null);

    RuleFor(x => x.RoastStyle)
      .NotEmpty()
      .WithMessage("RoastStyle is required")
      .MaximumLength(50)
      .WithMessage("RoastStyle must not exceed 50 characters")
      .When(x => x.RoastStyle != null);

    RuleFor(x => x.FlavourNotes)
      .MaximumLength(500)
      .When(x => x.FlavourNotes != null)
      .WithMessage("FlavourNotes must not exceed 500 characters");
  }
}