using Api.Database;
using Api.Database.Entities;
using Api.Features.Core;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Brewing.Brews
{
  public class BrewsController(AppDbContext dbContext, ILogger<BrewsController> logger) : BaseController
  {
    private readonly AppDbContext _dbContext = dbContext;
    private readonly ILogger<BrewsController> _logger = logger;

    /// <summary>
    /// Get all Brews.
    /// </summary>
    /// <returns>An array of all brews.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<Brew>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAllBrews()
    {

      var a = _dbContext.CoffeeBags.ToList();      
      var brew = _dbContext.Brews.ToList(); 
      var brews = await _dbContext.Brews.ToListAsync(); 
    
      return Ok(brews);
    }

  }
}