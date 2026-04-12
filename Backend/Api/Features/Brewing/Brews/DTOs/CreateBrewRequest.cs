namespace Api.Features.Brewing.Brews.DTOs
{
  using Api.Database;
  using Api.Features.Core.Auth;
  using FluentValidation;
  using Microsoft.EntityFrameworkCore;

  public class CreateBrewRequest
  {
    public int CoffeeBagId { get; set; }
    public required string BrewType { get; set; }
    public int BrewTasteScore { get; set; }
    public double CoffeeDose { get; set; }
    public double GrindSize { get; set; }
    public int BrewTime { get; set; }
    public double? BrewWeight { get; set; }
    public string? Notes { get; set; }
  }

  public class CreateBrewRequestValidator : AbstractValidator<CreateBrewRequest>
  {
    private readonly AppDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public CreateBrewRequestValidator(
        AppDbContext dbContext,
        ICurrentUserService currentUserService)
    {
      _dbContext = dbContext;
      _currentUserService = currentUserService;

      RuleFor(x => x.CoffeeBagId)
        .MustAsync(CoffeeBagExistsAndOwnedByUser)
        .WithMessage("CoffeeBag not found or access denied");

      RuleFor(x => x.BrewType)
        .NotEmpty()
        .WithMessage("BrewType is required")
        .MaximumLength(50)
        .WithMessage("BrewType must not exceed 50 characters");

      RuleFor(x => x.BrewTasteScore)
        .InclusiveBetween(0, 10)
        .WithMessage("BrewTasteScore must be between 0 and 10");

      RuleFor(x => x.CoffeeDose)
        .GreaterThan(0)
        .WithMessage("CoffeeDose must be greater than 0");

      RuleFor(x => x.GrindSize)
        .GreaterThan(0)
        .WithMessage("GrindSize must be greater than 0");

      RuleFor(x => x.BrewTime)
        .GreaterThan(0)
        .WithMessage("BrewTime must be greater than 0");

      RuleFor(x => x.BrewWeight)
        .GreaterThan(0)
        .When(x => x.BrewWeight.HasValue)
        .WithMessage("BrewWeight must be greater than 0");

      RuleFor(x => x.Notes)
        .MaximumLength(1000)
        .When(x => x.Notes != null)
        .WithMessage("Notes must not exceed 1000 characters");
    }

    private async Task<bool> CoffeeBagExistsAndOwnedByUser(int coffeeBagId, CancellationToken cancellationToken)
    {
      var userId = _currentUserService.GetCurrentUserId();
      if (!userId.HasValue)
        return false;

      return await _dbContext.CoffeeBags
        .AnyAsync(cb => cb.Id == coffeeBagId && cb.UserId == userId.Value, cancellationToken);
    }
  }
}
