namespace Api.Features.Brewing.CoffeeBags
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
  public class CoffeeBagsController : BaseController
  {
    private readonly AppDbContext _dbContext;
    private readonly ILogger<CoffeeBagsController> _logger;
    private readonly ICurrentUserService _currentUserService;

    public CoffeeBagsController(AppDbContext dbContext, ILogger<CoffeeBagsController> logger, ICurrentUserService currentUserService)
    {
      _dbContext = dbContext;
      _logger = logger;
      _currentUserService = currentUserService;
    }

    /// <summary>
    /// Get all Coffee Bags for current user.
    /// </summary>
    /// <returns>An array of user's coffee bags.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<CoffeeBag>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAllCoffeeBags()
    {
      var userId = _currentUserService.GetCurrentUserId();
      if (!userId.HasValue)
      {
        return Unauthorized();
      }

      var coffeeBags = await _dbContext.CoffeeBags
        .Where(cb => cb.UserId == userId.Value)
        .Include(cb => cb.Brews)
        .ToListAsync();

      return Ok(coffeeBags);
    }

    /// <summary>
    /// Get a coffee bag by ID for current user.
    /// </summary>
    /// <param name="id">The coffee bag ID.</param>
    /// <returns>The coffee bag with the specified ID.</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(CoffeeBag), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetCoffeeBagById(int id)
    {
      var userId = _currentUserService.GetCurrentUserId();
      if (!userId.HasValue)
      {
        return Unauthorized();
      }

      var coffeeBag = await _dbContext.CoffeeBags
        .Where(cb => cb.Id == id && cb.UserId == userId.Value)
        .Include(cb => cb.Brews)
        .FirstOrDefaultAsync();

      if (coffeeBag == null)
      {
        return NotFound();
      }

      return Ok(coffeeBag);
    }

    /// <summary>
    /// Create a new Coffee Bag for current user.
    /// </summary>
    /// <param name="coffeeBag">The coffee bag to create.</param>
    /// <returns>The created coffee bag.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(CoffeeBag), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CreateCoffeeBag([FromBody] CoffeeBag coffeeBag)
    {
      var userId = _currentUserService.GetCurrentUserId();
      if (!userId.HasValue)
      {
        return Unauthorized();
      }

      coffeeBag.UserId = userId.Value;

      _dbContext.CoffeeBags.Add(coffeeBag);
      await _dbContext.SaveChangesAsync();

      return CreatedAtAction(nameof(GetCoffeeBagById), new { id = coffeeBag.Id }, coffeeBag);
    }

    /// <summary>
    /// Update a coffee bag for current user.
    /// </summary>
    /// <param name="id">The coffee bag ID.</param>
    /// <param name="coffeeBag">The updated coffee bag data.</param>
    /// <returns>The updated coffee bag.</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(CoffeeBag), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateCoffeeBag(int id, [FromBody] CoffeeBag coffeeBag)
    {
      var userId = _currentUserService.GetCurrentUserId();
      if (!userId.HasValue)
      {
        return Unauthorized();
      }

      var existingCoffeeBag = await _dbContext.CoffeeBags
        .Where(cb => cb.Id == id && cb.UserId == userId.Value)
        .FirstOrDefaultAsync();

      if (existingCoffeeBag == null)
      {
        return NotFound();
      }

      existingCoffeeBag.Roaster = coffeeBag.Roaster;
      existingCoffeeBag.Origin = coffeeBag.Origin;
      existingCoffeeBag.RoastStyle = coffeeBag.RoastStyle;
      existingCoffeeBag.FlavourNotes = coffeeBag.FlavourNotes;
      existingCoffeeBag.Opened = coffeeBag.Opened;
      existingCoffeeBag.Emptied = coffeeBag.Emptied;

      await _dbContext.SaveChangesAsync();

      return Ok(existingCoffeeBag);
    }

    /// <summary>
    /// Delete a coffee bag for current user.
    /// </summary>
    /// <param name="id">The coffee bag ID.</param>
    /// <returns>No content.</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteCoffeeBag(int id)
    {
      var userId = _currentUserService.GetCurrentUserId();
      if (!userId.HasValue)
      {
        return Unauthorized();
      }

      var coffeeBag = await _dbContext.CoffeeBags
        .Where(cb => cb.Id == id && cb.UserId == userId.Value)
        .FirstOrDefaultAsync();

      if (coffeeBag == null)
      {
        return NotFound();
      }

      _dbContext.CoffeeBags.Remove(coffeeBag);
      await _dbContext.SaveChangesAsync();

      return NoContent();
    }
  }
}