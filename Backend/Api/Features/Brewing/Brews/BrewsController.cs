namespace Api.Features.Brewing.Brews
{
  using Api.Database;
  using Api.Database.Entities;
  using Api.Features.Auth;
  using Api.Features.Core;
  using Microsoft.AspNetCore.Authorization;
  using Microsoft.AspNetCore.Mvc;
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
    [ProducesResponseType(typeof(IEnumerable<BrewEntity>), StatusCodes.Status200OK)]
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

      return Ok(brews);
    }

    /// <summary>
    /// Create a new Brew for current user.
    /// </summary>
    /// <param name="brew">The brew to create.</param>
    /// <returns>The created brew.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(BrewEntity), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CreateBrew([FromBody] BrewEntity brew)
    {
      var userId = _currentUserService.GetCurrentUserId();
      if (!userId.HasValue)
      {
        return Unauthorized();
      }

      // Ensure the coffee bag belongs to the current user
      var coffeeBag = await _dbContext.CoffeeBags
        .FirstOrDefaultAsync(cb => cb.Id == brew.CoffeeBagId && cb.UserId == userId.Value);

      if (coffeeBag == null)
      {
        return BadRequest("Invalid CoffeeBag ID or access denied");
      }

      brew.UserId = userId.Value;

      _dbContext.Brews.Add(brew);
      await _dbContext.SaveChangesAsync();

      return CreatedAtAction(nameof(GetBrewById), new { id = brew.Id }, brew);
    }

    /// <summary>
    /// Get a brew by ID for current user.
    /// </summary>
    /// <param name="id">The brew ID.</param>
    /// <returns>The brew with the specified ID.</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(BrewEntity), StatusCodes.Status200OK)]
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

      return Ok(brew);
    }

    /// <summary>
    /// Update a brew for current user.
    /// </summary>
    /// <param name="id">The brew ID.</param>
    /// <param name="brew">The updated brew data.</param>
    /// <returns>The updated brew.</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(BrewEntity), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateBrew(int id, [FromBody] BrewEntity brew)
    {
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

      // Ensure the coffee bag belongs to the user if it's being changed
      if (brew.CoffeeBagId != existingBrew.CoffeeBagId)
      {
        var coffeeBag = await _dbContext.CoffeeBags
          .FirstOrDefaultAsync(cb => cb.Id == brew.CoffeeBagId && cb.UserId == userId.Value);

        if (coffeeBag == null)
        {
          return BadRequest("Invalid CoffeeBag ID or access denied");
        }
      }

      existingBrew.BrewType = brew.BrewType;
      existingBrew.CoffeeDose = brew.CoffeeDose;
      existingBrew.GrindSize = brew.GrindSize;
      existingBrew.OutputTime = brew.OutputTime;
      existingBrew.OutputWeight = brew.OutputWeight;
      existingBrew.OutputTasteScore = brew.OutputTasteScore;
      existingBrew.OutputAddedWeight = brew.OutputAddedWeight;
      existingBrew.OutputAddedTasteScore = brew.OutputAddedTasteScore;
      existingBrew.Notes = brew.Notes;
      existingBrew.CoffeeBagId = brew.CoffeeBagId;

      await _dbContext.SaveChangesAsync();

      return Ok(existingBrew);
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