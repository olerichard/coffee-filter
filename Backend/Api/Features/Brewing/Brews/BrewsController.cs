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

      var brewDtos = brews.Select(b => new BrewResponse
      {
        Id = b.Id,
        CoffeeBagId = b.CoffeeBagId,
        CoffeeBag = new CoffeeBagResponse
        {
          Id = b.CoffeeBag.Id,
          UserId = b.CoffeeBag.UserId,
          Roaster = b.CoffeeBag.Roaster,
          Origin = b.CoffeeBag.Origin,
          RoastStyle = b.CoffeeBag.RoastStyle,
          FlavourNotes = b.CoffeeBag.FlavourNotes,
          Opened = b.CoffeeBag.Opened,
          Emptied = b.CoffeeBag.Emptied,
        },
        BrewType = b.BrewType ?? "",
        CoffeeDose = b.CoffeeDose ?? 0,
        GrindSize = b.GrindSize ?? 0,
        BrewTime = b.BrewTime ?? 0,
        BrewWeight = b.BrewWeight ?? 0,
        BrewTasteScore = b.BrewTasteScore ?? 0,
        Notes = b.Notes,
        BrewedOn = b.CreatedOn ?? DateTime.UtcNow,
      }).OrderByDescending(b => b.BrewedOn) .ToList();

      return Ok(brewDtos);
    }

    /// <summary>
    /// Create a new Brew for current user.
    /// </summary>
    /// <param name="request">The brew to create.</param>
    /// <param name="validator">The validator for the request.</param>
    /// <returns>The created brew.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(BrewEntity), StatusCodes.Status201Created)]
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

      var brew = new BrewEntity
      {
        UserId = userId.Value,
        CoffeeBagId = request.CoffeeBagId,
        BrewType = request.BrewType,
        CoffeeDose = request.CoffeeDose,
        GrindSize = request.GrindSize,
        BrewTime = request.BrewTime,
        BrewWeight = request.BrewWeight,
        BrewTasteScore = request.BrewTasteScore,
        Notes = request.Notes,
      };

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

      var brewDto = new BrewResponse
      {
        Id = brew.Id,
        CoffeeBagId = brew.CoffeeBagId,
        CoffeeBag = new CoffeeBagResponse
        {
          Id = brew.CoffeeBag.Id,
          UserId = brew.CoffeeBag.UserId,
          Roaster = brew.CoffeeBag.Roaster,
          Origin = brew.CoffeeBag.Origin,
          RoastStyle = brew.CoffeeBag.RoastStyle,
          FlavourNotes = brew.CoffeeBag.FlavourNotes,
          Opened = brew.CoffeeBag.Opened,
          Emptied = brew.CoffeeBag.Emptied,
        },
        BrewType = brew.BrewType ?? "",
        CoffeeDose = brew.CoffeeDose ?? 0,
        GrindSize = brew.GrindSize ?? 0,
        BrewTime = brew.BrewTime ?? 0,
        BrewWeight = brew.BrewWeight ?? 0,
        BrewTasteScore = brew.BrewTasteScore ?? 0,
        Notes = brew.Notes,
        BrewedOn = brew.CreatedOn ?? DateTime.UtcNow,
      };

      return Ok(brewDto);
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
      existingBrew.BrewTime = brew.BrewTime;
      existingBrew.BrewWeight = brew.BrewWeight;
      existingBrew.BrewTasteScore = brew.BrewTasteScore;
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