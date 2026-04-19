namespace Api.Features.CoffeeBags.DTOs;

using FluentValidation;

public class UpdateCoffeeBagRequest
{
  public required string Roaster { get; set; }
  public required string Origin { get; set; }
  public required string RoastStyle { get; set; }
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
      .WithMessage("Roaster must not exceed 100 characters");

    RuleFor(x => x.Origin)
      .NotEmpty()
      .WithMessage("Origin is required")
      .MaximumLength(100)
      .WithMessage("Origin must not exceed 100 characters");

    RuleFor(x => x.RoastStyle)
      .NotEmpty()
      .WithMessage("RoastStyle is required")
      .MaximumLength(50)
      .WithMessage("RoastStyle must not exceed 50 characters");

    RuleFor(x => x.FlavourNotes)
      .MaximumLength(500)
      .When(x => x.FlavourNotes != null)
      .WithMessage("FlavourNotes must not exceed 500 characters");
  }
}