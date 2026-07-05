namespace Api.Features.BrewMethods
{
  using Api.Database;
  using Api.Core;
  using Api.Core.Auth;

  using Microsoft.AspNetCore.Mvc;
  using Microsoft.AspNetCore.Mvc.ModelBinding;
  using Microsoft.EntityFrameworkCore;
  using Api.Features.BrewMethods.DTOs;

  public class BrewMethodsController : BaseController
  {
    private readonly AppDbContext _dbContext;
    private readonly ILogger<BrewMethodsController> _logger;

    public BrewMethodsController(AppDbContext dbContext, ILogger<BrewMethodsController> logger)
    {
      _dbContext = dbContext;
      _logger = logger;
    }

    /// <summary>
    /// Get all Brew Methods.
    /// </summary>
    /// <returns>An array of all brew methods.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<BrewMethodResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAllBrewMethods()
    {
      var methods = await _dbContext.BrewMethods
        .ToListAsync();

      var dtos = methods.Select(m => m.ToBrewMethodResponse()).OrderBy(m => m.Name).ToList();

      return Ok(dtos);
    }

    /// <summary>
    /// Create a new Brew Method.
    /// </summary>
    /// <param name="request">The brew method to create.</param>
    /// <param name="validator">The validator for the request.</param>
    /// <returns>The created brew method.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(BrewMethodResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CreateBrewMethod(
        [FromBody] CreateBrewMethodRequest request,
        [FromServices] CreateBrewMethodRequestValidator validator)
    {
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

      var method = request.ToBrewMethod();
      _dbContext.BrewMethods.Add(method);
      await _dbContext.SaveChangesAsync();

      return CreatedAtAction(nameof(GetBrewMethodById), new { id = method.Id }, method.ToBrewMethodResponse());
    }

    /// <summary>
    /// Get a brew method by ID.
    /// </summary>
    /// <param name="id">The brew method ID.</param>
    /// <returns>The brew method with the specified ID.</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(BrewMethodResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetBrewMethodById(int id)
    {
      var method = await _dbContext.BrewMethods
        .FirstOrDefaultAsync(m => m.Id == id);

      if (method == null)
      {
        return NotFound();
      }

      return Ok(method.ToBrewMethodResponse());
    }

    /// <summary>
    /// Update a brew method.
    /// </summary>
    /// <param name="id">The brew method ID.</param>
    /// <param name="request">The updated brew method data.</param>
    /// <param name="validator">The validator for the request.</param>
    /// <returns>The updated brew method.</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(BrewMethodResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateBrewMethod(
        int id,
        [FromBody] UpdateBrewMethodRequest request,
        [FromServices] UpdateBrewMethodRequestValidator validator)
    {
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

      var existingMethod = await _dbContext.BrewMethods
        .FirstOrDefaultAsync(m => m.Id == id);

      if (existingMethod == null)
      {
        return NotFound();
      }

      existingMethod.UpdateBrewMethod(request);
      await _dbContext.SaveChangesAsync();

      return Ok(existingMethod.ToBrewMethodResponse());
    }
  }
}
