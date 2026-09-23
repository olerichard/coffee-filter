namespace Api.Features.UserGrinders
{
  using Api.Database;
  using Api.Core;
  using Api.Core.Auth;
  using Api.Features.UserGrinders.DTOs;

  using Microsoft.AspNetCore.Mvc;
  using Microsoft.AspNetCore.Mvc.ModelBinding;
  using Microsoft.EntityFrameworkCore;

  public class UserGrindersController : BaseController
  {
    private readonly AppDbContext _dbContext;
    private readonly ILogger<UserGrindersController> _logger;
    private readonly ICurrentUserService _currentUserService;

    public UserGrindersController(
        AppDbContext dbContext,
        ILogger<UserGrindersController> logger,
        ICurrentUserService currentUserService)
    {
      _dbContext = dbContext;
      _logger = logger;
      _currentUserService = currentUserService;
    }

    /// <summary>
    /// Get all grinders owned by the current user.
    /// </summary>
    /// <returns>An array of the user's grinders.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<UserGrinderResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAllUserGrinders()
    {
      var userId = _currentUserService.GetCurrentUserId();
      if (!userId.HasValue)
      {
        return Unauthorized();
      }

      var grinders = await _dbContext.UserGrinders
        .Where(ug => ug.UserId == userId.Value)
        .Include(ug => ug.GrinderModel)
        .OrderByDescending(ug => ug.LastModifiedOn)
        .ThenByDescending(ug => ug.CreatedOn)
        .ToListAsync();

      var response = grinders.Select(ug => ug.ToUserGrinderResponse()).ToList();

      return Ok(response);
    }

    /// <summary>
    /// Get a grinder owned by the current user by ID.
    /// </summary>
    /// <param name="id">The user grinder ID.</param>
    /// <returns>The user's grinder with the specified ID.</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(UserGrinderResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetUserGrinderById(int id)
    {
      var userId = _currentUserService.GetCurrentUserId();
      if (!userId.HasValue)
      {
        return Unauthorized();
      }

      var grinder = await _dbContext.UserGrinders
        .Where(ug => ug.Id == id && ug.UserId == userId.Value)
        .Include(ug => ug.GrinderModel)
        .FirstOrDefaultAsync();

      if (grinder == null)
      {
        return NotFound();
      }

      return Ok(grinder.ToUserGrinderResponse());
    }

    /// <summary>
    /// Register that the current user owns a grinder model.
    /// </summary>
    /// <param name="request">The grinder model to claim ownership of.</param>
    /// <param name="validator">The validator for the request.</param>
    /// <returns>The created ownership record.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(UserGrinderResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CreateUserGrinder(
        [FromBody] CreateUserGrinderRequest request,
        [FromServices] CreateUserGrinderRequestValidator validator)
    {
      var userId = _currentUserService.GetCurrentUserId();
      var userName = _currentUserService.GetCurrentUserName();
      if (!userId.HasValue || userName == null)
      {
        return Unauthorized();
      }

      var validationResult = await validator.ValidateAsync(request);
      if (!validationResult.IsValid)
      {
        var modelState = new ModelStateDictionary();
        foreach (var error in validationResult.Errors)
        {
          modelState.AddModelError(error.PropertyName, error.ErrorMessage);
        }
        return ValidationProblem(modelState);
      }

      var userGrinder = request.ToUserGrinderEntity(userId.Value, userName);
      _dbContext.UserGrinders.Add(userGrinder);
      await _dbContext.SaveChangesAsync();

      var created = await _dbContext.UserGrinders
        .Where(ug => ug.Id == userGrinder.Id)
        .Include(ug => ug.GrinderModel)
        .FirstAsync();

      return CreatedAtAction(nameof(GetUserGrinderById), new { id = created.Id }, created.ToUserGrinderResponse());
    }

    /// <summary>
    /// Remove a grinder from the current user's collection.
    /// </summary>
    /// <param name="id">The user grinder ID.</param>
    /// <returns>No content.</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteUserGrinder(int id)
    {
      var userId = _currentUserService.GetCurrentUserId();
      if (!userId.HasValue)
      {
        return Unauthorized();
      }

      var grinder = await _dbContext.UserGrinders
        .Where(ug => ug.Id == id && ug.UserId == userId.Value)
        .FirstOrDefaultAsync();

      if (grinder == null)
      {
        return NotFound();
      }

      _dbContext.UserGrinders.Remove(grinder);
      await _dbContext.SaveChangesAsync();

      return NoContent();
    }
  }
}
