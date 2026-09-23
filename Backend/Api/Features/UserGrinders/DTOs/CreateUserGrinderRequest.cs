namespace Api.Features.UserGrinders.DTOs
{
  using Api.Database;
  using Api.Core.Auth;
  using FluentValidation;
  using Microsoft.EntityFrameworkCore;

  public record CreateUserGrinderRequest
  {
    public int GrinderModelId { get; set; }
  }

  public class CreateUserGrinderRequestValidator : AbstractValidator<CreateUserGrinderRequest>
  {
    private readonly AppDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public CreateUserGrinderRequestValidator(
        AppDbContext dbContext,
        ICurrentUserService currentUserService)
    {
      _dbContext = dbContext;
      _currentUserService = currentUserService;

      RuleFor(x => x.GrinderModelId)
        .GreaterThan(0)
        .WithMessage("GrinderModelId must be greater than 0");

      RuleFor(x => x.GrinderModelId)
        .MustAsync(GrinderModelExists)
        .WithMessage("Grinder model not found");

      RuleFor(x => x.GrinderModelId)
        .MustAsync(NotAlreadyOwned)
        .WithMessage("You already own this grinder");
    }

    private async Task<bool> GrinderModelExists(int grinderModelId, CancellationToken cancellationToken)
    {
      return await _dbContext.GrinderModels
        .AnyAsync(g => g.Id == grinderModelId, cancellationToken);
    }

    private async Task<bool> NotAlreadyOwned(int grinderModelId, CancellationToken cancellationToken)
    {
      var userId = _currentUserService.GetCurrentUserId();
      if (!userId.HasValue)
        return false;

      return !await _dbContext.UserGrinders
        .AnyAsync(ug => ug.UserId == userId.Value && ug.GrinderModelId == grinderModelId, cancellationToken);
    }
  }
}
