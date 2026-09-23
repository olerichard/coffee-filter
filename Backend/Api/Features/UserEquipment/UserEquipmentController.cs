namespace Api.Features.UserEquipment
{
  using Api.Database;
  using Api.Core;
  using Api.Core.Auth;
  using Api.Features.UserEquipment.DTOs;

  using Microsoft.AspNetCore.Mvc;
  using Microsoft.AspNetCore.Mvc.ModelBinding;
  using Microsoft.EntityFrameworkCore;

  public class UserEquipmentController : BaseController
  {
    private readonly AppDbContext _dbContext;
    private readonly ILogger<UserEquipmentController> _logger;
    private readonly ICurrentUserService _currentUserService;

    public UserEquipmentController(
        AppDbContext dbContext,
        ILogger<UserEquipmentController> logger,
        ICurrentUserService currentUserService)
    {
      _dbContext = dbContext;
      _logger = logger;
      _currentUserService = currentUserService;
    }

    /// <summary>
    /// Get all equipment owned by the current user.
    /// </summary>
    /// <returns>An array of the user's equipment.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<UserEquipmentResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAllUserEquipment()
    {
      var userId = _currentUserService.GetCurrentUserId();
      if (!userId.HasValue)
      {
        return Unauthorized();
      }

      var equipment = await _dbContext.UserEquipment
        .Where(ue => ue.UserId == userId.Value)
        .Include(ue => ue.GrinderModel)
        .OrderByDescending(ue => ue.LastModifiedOn)
        .ThenByDescending(ue => ue.CreatedOn)
        .ToListAsync();

      var response = equipment.Select(ue => ue.ToUserEquipmentResponse()).ToList();

      return Ok(response);
    }

    /// <summary>
    /// Get equipment owned by the current user by ID.
    /// </summary>
    /// <param name="id">The user equipment ID.</param>
    /// <returns>The user's equipment with the specified ID.</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(UserEquipmentResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetUserEquipmentById(int id)
    {
      var userId = _currentUserService.GetCurrentUserId();
      if (!userId.HasValue)
      {
        return Unauthorized();
      }

      var equipment = await _dbContext.UserEquipment
        .Where(ue => ue.Id == id && ue.UserId == userId.Value)
        .Include(ue => ue.GrinderModel)
        .FirstOrDefaultAsync();

      if (equipment == null)
      {
        return NotFound();
      }

      return Ok(equipment.ToUserEquipmentResponse());
    }

    /// <summary>
    /// Register that the current user owns equipment for the given grinder model.
    /// </summary>
    /// <param name="request">The grinder model to claim ownership of.</param>
    /// <param name="validator">The validator for the request.</param>
    /// <returns>The created ownership record.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(UserEquipmentResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CreateUserEquipment(
        [FromBody] CreateUserEquipmentRequest request,
        [FromServices] CreateUserEquipmentRequestValidator validator)
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

      var userEquipment = request.ToUserEquipmentEntity(userId.Value, userName);
      _dbContext.UserEquipment.Add(userEquipment);
      await _dbContext.SaveChangesAsync();

      var created = await _dbContext.UserEquipment
        .Where(ue => ue.Id == userEquipment.Id)
        .Include(ue => ue.GrinderModel)
        .FirstAsync();

      return CreatedAtAction(nameof(GetUserEquipmentById), new { id = created.Id }, created.ToUserEquipmentResponse());
    }

    /// <summary>
    /// Remove a piece of equipment from the current user's collection.
    /// </summary>
    /// <param name="id">The user equipment ID.</param>
    /// <returns>No content.</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteUserEquipment(int id)
    {
      var userId = _currentUserService.GetCurrentUserId();
      if (!userId.HasValue)
      {
        return Unauthorized();
      }

      var equipment = await _dbContext.UserEquipment
        .Where(ue => ue.Id == id && ue.UserId == userId.Value)
        .FirstOrDefaultAsync();

      if (equipment == null)
      {
        return NotFound();
      }

      _dbContext.UserEquipment.Remove(equipment);
      await _dbContext.SaveChangesAsync();

      return NoContent();
    }
  }
}
