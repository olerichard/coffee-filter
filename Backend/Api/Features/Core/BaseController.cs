 using Microsoft.AspNetCore.Mvc;
 
 namespace Api.Features.Core
{
  [ApiController]
  [Route("api/[controller]")]
  [Produces("application/json")]
  public abstract class BaseController : Controller
  {
  }
}