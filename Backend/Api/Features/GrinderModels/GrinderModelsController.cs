namespace Api.Features.GrinderModels
{
  using Api.Database;
  using Api.Core;
  using Api.Core.Auth;
  using Api.Database.Entities;
  using Api.Features.GrinderModels.DTOs;

  using Microsoft.AspNetCore.Mvc;
  using Microsoft.AspNetCore.Mvc.ModelBinding;
  using Microsoft.EntityFrameworkCore;

  public class GrinderModelsController : BaseController
  {
    private readonly AppDbContext _dbContext;
    private readonly ILogger<GrinderModelsController> _logger;
    private readonly ICurrentUserService _currentUserService;

    public GrinderModelsController(
        AppDbContext dbContext,
        ILogger<GrinderModelsController> logger,
        ICurrentUserService currentUserService)
    {
      _dbContext = dbContext;
      _logger = logger;
      _currentUserService = currentUserService;
    }

    /// <summary>
    /// Get all grinder models.
    /// </summary>
    /// <param name="style">Optional filter by grinder style.</param>
    /// <returns>An array of all grinder models.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<GrinderModelResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAllGrinderModels([FromQuery] GrinderStyle? style = null)
    {
      var query = _dbContext.GrinderModels.AsQueryable();

      if (style.HasValue)
      {
        query = query.Where(g => g.Style == style.Value);
      }

      var models = await query.ToListAsync();

      var dtos = models
        .Select(m => m.ToGrinderModelResponse())
        .OrderBy(m => m.Manufacturer)
        .ThenBy(m => m.ModelName)
        .ToList();

      return Ok(dtos);
    }

    /// <summary>
    /// Get a grinder model by ID.
    /// </summary>
    /// <param name="id">The grinder model ID.</param>
    /// <returns>The grinder model with the specified ID.</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(GrinderModelResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetGrinderModelById(int id)
    {
      var model = await _dbContext.GrinderModels
        .FirstOrDefaultAsync(g => g.Id == id);

      if (model == null)
      {
        return NotFound();
      }

      return Ok(model.ToGrinderModelResponse());
    }

    /// <summary>
    /// Register a new grinder model in the shared catalog.
    /// </summary>
    /// <param name="request">The grinder model to create.</param>
    /// <param name="validator">The validator for the request.</param>
    /// <returns>The created grinder model.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(GrinderModelResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CreateGrinderModel(
        [FromBody] CreateGrinderModelRequest request,
        [FromServices] CreateGrinderModelRequestValidator validator)
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

      var model = request.ToGrinderModelEntity(userName);
      _dbContext.GrinderModels.Add(model);
      await _dbContext.SaveChangesAsync();

      return CreatedAtAction(nameof(GetGrinderModelById), new { id = model.Id }, model.ToGrinderModelResponse());
    }

    /// <summary>
    /// Update a grinder model.
    /// </summary>
    /// <param name="id">The grinder model ID.</param>
    /// <param name="request">The updated grinder model data.</param>
    /// <param name="validator">The validator for the request.</param>
    /// <returns>The updated grinder model.</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(GrinderModelResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateGrinderModel(
        int id,
        [FromBody] UpdateGrinderModelRequest request,
        [FromServices] UpdateGrinderModelRequestValidator validator)
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

      var existingModel = await _dbContext.GrinderModels
        .FirstOrDefaultAsync(g => g.Id == id);

      if (existingModel == null)
      {
        return NotFound();
      }

      existingModel.UpdateGrinderModelEntity(request, userName);
      await _dbContext.SaveChangesAsync();

      return Ok(existingModel.ToGrinderModelResponse());
    }
  }
}
