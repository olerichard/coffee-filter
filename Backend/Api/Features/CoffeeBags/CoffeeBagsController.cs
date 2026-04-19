namespace Api.Features.CoffeeBags;

using Api.Database;
using Api.Database.Entities;
using Api.Features.CoffeeBags.DTOs;
using Api.Features.Core;
using Api.Features.Core.Auth;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
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
  [ProducesResponseType(typeof(IEnumerable<CoffeeBagResponse>), StatusCodes.Status200OK)]
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

    var responses = coffeeBags.Select(cb => cb.ToCoffeeBagResponse()).ToList();

    return Ok(responses);
  }

  /// <summary>
  /// Get a coffee bag by ID for current user.
  /// </summary>
  /// <param name="id">The coffee bag ID.</param>
  /// <returns>The coffee bag with the specified ID.</returns>
  [HttpGet("{id}")]
  [ProducesResponseType(typeof(CoffeeBagResponse), StatusCodes.Status200OK)]
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

    return Ok(coffeeBag.ToCoffeeBagResponse());
  }

  /// <summary>
  /// Create a new Coffee Bag for current user.
  /// </summary>
  /// <param name="request">The coffee bag to create.</param>
  /// <param name="validator">The validator for the request.</param>
  /// <returns>The created coffee bag.</returns>
  [HttpPost]
  [ProducesResponseType(typeof(CoffeeBagResponse), StatusCodes.Status201Created)]
  [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
  [ProducesResponseType(StatusCodes.Status500InternalServerError)]
  public async Task<IActionResult> CreateCoffeeBag(
      [FromBody] CreateCoffeeBagRequest request,
      [FromServices] CreateCoffeeBagRequestValidator validator)
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

    var coffeeBag = request.ToCoffeeBagEntity(userId.Value);
    _dbContext.CoffeeBags.Add(coffeeBag);
    await _dbContext.SaveChangesAsync();

    var createdCoffeeBag = await _dbContext.CoffeeBags
      .FirstAsync(cb => cb.Id == coffeeBag.Id);

    var response = createdCoffeeBag.ToCoffeeBagResponse();
    return CreatedAtAction(nameof(GetCoffeeBagById), new { id = response.Id }, response);
  }

  /// <summary>
  /// Update a coffee bag for current user.
  /// </summary>
  /// <param name="id">The coffee bag ID.</param>
  /// <param name="request">The updated coffee bag data.</param>
  /// <param name="validator">The validator for the request.</param>
  /// <returns>The updated coffee bag.</returns>
  [HttpPut("{id}")]
  [ProducesResponseType(typeof(CoffeeBagResponse), StatusCodes.Status200OK)]
  [ProducesResponseType(StatusCodes.Status404NotFound)]
  [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
  [ProducesResponseType(StatusCodes.Status500InternalServerError)]
  public async Task<IActionResult> UpdateCoffeeBag(
      int id,
      [FromBody] UpdateCoffeeBagRequest request,
      [FromServices] UpdateCoffeeBagRequestValidator validator)
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

    var existingCoffeeBag = await _dbContext.CoffeeBags
      .Where(cb => cb.Id == id && cb.UserId == userId.Value)
      .FirstOrDefaultAsync();

    if (existingCoffeeBag == null)
    {
      return NotFound();
    }

    existingCoffeeBag.UpdateCoffeeBagEntity(request);
    await _dbContext.SaveChangesAsync();

    return Ok(existingCoffeeBag.ToCoffeeBagResponse());
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