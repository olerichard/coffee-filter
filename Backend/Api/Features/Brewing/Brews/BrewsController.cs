namespace Api.Features.Brewing.Brews
{
  using Api.Database;
  using Api.Database.Entities;
  using Api.Features.Brewing.Brews.DTOs;
  using Api.Features.Brewing.DTOs;
  using Api.Features.Core;
  using Api.Features.Core.Auth;

  using Microsoft.AspNetCore.Authorization;
  using Microsoft.AspNetCore.Mvc;
  using Microsoft.AspNetCore.Mvc.ModelBinding;
  using Microsoft.EntityFrameworkCore;

  [ApiController]
  [Route("api/[controller]")]
  [Authorize]
  public class BrewsController : BaseController
  {
    private readonly AppDbContext _dbContext;
    private readonly ILogger<BrewsController> _logger;
    private readonly ICurrentUserService _currentUserService;

    public BrewsController(AppDbContext dbContext, ILogger<BrewsController> logger, ICurrentUserService currentUserService)
    {
      _dbContext = dbContext;
      _logger = logger;
      _currentUserService = currentUserService;
    }

    /// <summary>
    /// Get all Brews for current user.
    /// </summary>
    /// <returns>An array of user's brews.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<BrewResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAllBrews()
    {
      var userId = _currentUserService.GetCurrentUserId();
      if (!userId.HasValue)
      {
        return Unauthorized();
      }

      var brews = await _dbContext.Brews
        .Where(b => b.UserId == userId.Value)
        .Include(b => b.CoffeeBag)
        .Include(b => b.User)
        .ToListAsync();

      var brewDtos = brews.Select(b => b.ToBrewResponse()).OrderByDescending(b => b.BrewedOn) .ToList();

      return Ok(brewDtos);
    }

    /// <summary>
    /// Create a new Brew for current user.
    /// </summary>
    /// <param name="request">The brew to create.</param>
    /// <param name="validator">The validator for the request.</param>
    /// <returns>The created brew.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(BrewResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CreateBrew(
        [FromBody] CreateBrewRequest request,
        [FromServices] CreateBrewRequestValidator validator)
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

      var userId = _currentUserService.GetCurrentUserId();
      if (!userId.HasValue)
      {
        return Unauthorized();
      }

      var brew = request.ToBrew(userId.Value);
      _dbContext.Brews.Add(brew);
      await _dbContext.SaveChangesAsync();

      var createdBrew = await _dbContext.Brews
        .Include(b => b.CoffeeBag)
        .FirstAsync(b => b.Id == brew.Id);

      var response = createdBrew.ToBrewResponse();
      return CreatedAtAction(nameof(GetBrewById), new { id = response.Id }, response);
    }

    /// <summary>
    /// Get a brew by ID for current user.
    /// </summary>
    /// <param name="id">The brew ID.</param>
    /// <returns>The brew with the specified ID.</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(BrewResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetBrewById(int id)
    {
      var userId = _currentUserService.GetCurrentUserId();
      if (!userId.HasValue)
      {
        return Unauthorized();
      }

      var brew = await _dbContext.Brews
        .Where(b => b.Id == id && b.UserId == userId.Value)
        .Include(b => b.CoffeeBag)
        .Include(b => b.User)
        .FirstOrDefaultAsync();

      if (brew == null)
      {
        return NotFound();
      }
      
      return Ok(brew.ToBrewResponse());
    }

    /// <summary>
    /// Update a brew for current user.
    /// </summary>
    /// <param name="id">The brew ID.</param>
    /// <param name="request">The updated brew data.</param>
    /// <param name="validator">The validator for the request.</param>
    /// <returns>The updated brew.</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(BrewResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateBrew(
        int id,
        [FromBody] UpdateBrewRequest request,
        [FromServices] UpdateBrewRequestValidator validator)
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

      var userId = _currentUserService.GetCurrentUserId();
      if (!userId.HasValue)
      {
        return Unauthorized();
      }

      var existingBrew = await _dbContext.Brews
        .Where(b => b.Id == id && b.UserId == userId.Value)
        .FirstOrDefaultAsync();

      if (existingBrew == null)
      {
        return NotFound();
      }

      if (request.CoffeeBagId.HasValue && request.CoffeeBagId != existingBrew.CoffeeBagId)
      {
        var coffeeBag = await _dbContext.CoffeeBags
          .FirstOrDefaultAsync(cb => cb.Id == request.CoffeeBagId && cb.UserId == userId.Value);

        if (coffeeBag == null)
        {
          return BadRequest("Invalid CoffeeBag ID or access denied");
        }
      }

      existingBrew.UpdateBrew(request);

      await _dbContext.SaveChangesAsync();

      var updatedBrew = await _dbContext.Brews
        .Include(b => b.CoffeeBag)
        .FirstAsync(b => b.Id == id);

      return Ok(updatedBrew.ToBrewResponse());
    }

    /// <summary>
    /// Delete a brew for current user.
    /// </summary>
    /// <param name="id">The brew ID.</param>
    /// <returns>No content.</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteBrew(int id)
    {
      var userId = _currentUserService.GetCurrentUserId();
      if (!userId.HasValue)
      {
        return Unauthorized();
      }

      var brew = await _dbContext.Brews
        .Where(b => b.Id == id && b.UserId == userId.Value)
        .FirstOrDefaultAsync();

      if (brew == null)
      {
        return NotFound();
      }

      _dbContext.Brews.Remove(brew);
      await _dbContext.SaveChangesAsync();

      return NoContent();
    }
  }
}