using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
 
 namespace Api.Core
 {
  [ApiController]
  [Route("api/[controller]")]
  [Produces("application/json")]
  [Authorize]
  public abstract class BaseController : Controller
  {
  }
 }