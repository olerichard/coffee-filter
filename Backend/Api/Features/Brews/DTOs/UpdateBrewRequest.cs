namespace Api.Features.Brews.DTOs
{
  using Api.Database;
  using Api.Core.Auth;
  using FluentValidation;
  using Microsoft.EntityFrameworkCore;

  public record UpdateBrewRequest
  {
    public int? CoffeeBagId { get; set; }
    public int? BrewMethodId { get; set; }
    public int? BrewTasteScore { get; set; }
    public double? CoffeeDose { get; set; }
    public double? GrindSize { get; set; }
    public int? BrewTime { get; set; }
    public double? BrewWeight { get; set; }
    public string? Notes { get; set; }
  }

  public class UpdateBrewRequestValidator : AbstractValidator<UpdateBrewRequest>
  {
    private readonly AppDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public UpdateBrewRequestValidator(
        AppDbContext dbContext,
        ICurrentUserService currentUserService)
    {
      _dbContext = dbContext;
      _currentUserService = currentUserService;

      RuleFor(x => x.CoffeeBagId)
        .MustAsync(async (id, ct) =>
        {
          if (!id.HasValue) return true;
          var userId = _currentUserService.GetCurrentUserId();
          if (!userId.HasValue) return false;
          return await _dbContext.CoffeeBags.AnyAsync(cb => cb.Id == id.Value && cb.UserId == userId.Value, ct);
        })
        .When(x => x.CoffeeBagId.HasValue)
        .WithMessage("CoffeeBag not found or access denied");

      RuleFor(x => x.BrewMethodId)
        .MustAsync(async (id, ct) =>
        {
          if (!id.HasValue) return true;
          return await _dbContext.BrewMethods.AnyAsync(m => m.Id == id.Value, ct);
        })
        .When(x => x.BrewMethodId.HasValue)
        .WithMessage("BrewMethod not found");

      RuleFor(x => x.BrewTasteScore)
        .InclusiveBetween(0, 10)
        .When(x => x.BrewTasteScore.HasValue)
        .WithMessage("BrewTasteScore must be between 0 and 10");

      RuleFor(x => x.CoffeeDose)
        .GreaterThan(0)
        .When(x => x.CoffeeDose.HasValue)
        .WithMessage("CoffeeDose must be greater than 0");

      RuleFor(x => x.GrindSize)
        .GreaterThan(0)
        .When(x => x.GrindSize.HasValue)
        .WithMessage("GrindSize must be greater than 0");

      RuleFor(x => x.BrewTime)
        .GreaterThan(0)
        .When(x => x.BrewTime.HasValue)
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