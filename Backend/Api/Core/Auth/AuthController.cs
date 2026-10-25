namespace Api.Core.Auth
{
  using Api.Core.Users;
  using Api.Database;
  using Api.Database.Entities;
  using FluentValidation.Results;
  using Microsoft.AspNetCore.Authorization;
  using Microsoft.AspNetCore.Identity;
  using Microsoft.AspNetCore.Mvc;
  using Microsoft.AspNetCore.Mvc.ModelBinding;
  using Microsoft.AspNetCore.RateLimiting;
  using Microsoft.EntityFrameworkCore;
  using Microsoft.Extensions.Options;

  [ApiController]
  [Route("api/auth")]
  [Produces("application/json")]
  [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
  public class AuthController : Controller
  {
    private const string InvalidCredentialsMessage = "Invalid username or password";

    private readonly AppDbContext _dbContext;
    private readonly IPasswordHasher<UserEntity> _passwordHasher;
    private readonly IJwtService _jwtService;
    private readonly IRefreshTokenService _refreshTokenService;
    private readonly RefreshTokenCookieService _refreshTokenCookieService;
    private readonly ICurrentUserService _currentUserService;
    private readonly DummyPasswordHash _dummyPasswordHash;
    private readonly LockoutSettings _lockoutSettings;
    private readonly CorsSettings _corsSettings;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
      AppDbContext dbContext,
      IPasswordHasher<UserEntity> passwordHasher,
      IJwtService jwtService,
      IRefreshTokenService refreshTokenService,
      RefreshTokenCookieService refreshTokenCookieService,
      ICurrentUserService currentUserService,
      DummyPasswordHash dummyPasswordHash,
      IOptions<LockoutSettings> lockoutSettings,
      IOptions<CorsSettings> corsSettings,
      TimeProvider timeProvider,
      ILogger<AuthController> logger)
    {
      _dbContext = dbContext;
      _passwordHasher = passwordHasher;
      _jwtService = jwtService;
      _refreshTokenService = refreshTokenService;
      _refreshTokenCookieService = refreshTokenCookieService;
      _currentUserService = currentUserService;
      _dummyPasswordHash = dummyPasswordHash;
      _lockoutSettings = lockoutSettings.Value;
      _corsSettings = corsSettings.Value;
      _timeProvider = timeProvider;
      _logger = logger;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting(RateLimitPolicies.Login)]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(
      [FromBody] LoginRequest request,
      [FromServices] LoginRequestValidator validator,
      CancellationToken cancellationToken)
    {
      if (!IsAllowedOrigin())
      {
        return StatusCode(StatusCodes.Status403Forbidden);
      }

      var validationResult = await validator.ValidateAsync(request, cancellationToken);
      if (!validationResult.IsValid)
      {
        return ValidationProblemFrom(validationResult);
      }

      var user = await _dbContext.Users
        .FirstOrDefaultAsync(u => u.Username == request.Username, cancellationToken);

      if (user is null)
      {
        // Keep the failure path expensive and uniform for unknown usernames.
        _passwordHasher.VerifyHashedPassword(null!, _dummyPasswordHash.Value, request.Password);

        _logger.LogWarning(
          "Login failed for unknown username from {IpAddress}.",
          GetIpAddress());

        return Unauthorized(new { message = InvalidCredentialsMessage });
      }

      var now = _timeProvider.GetUtcNow().UtcDateTime;
      var isLockedOut = user.LockoutEnd.HasValue && user.LockoutEnd.Value > now;

      var verification = _passwordHasher.VerifyHashedPassword(
        user,
        user.PasswordHash,
        request.Password);

      var passwordValid = verification is
        PasswordVerificationResult.Success or
        PasswordVerificationResult.SuccessRehashNeeded;

      if (!user.IsActive)
      {
        _logger.LogWarning("Login blocked for inactive user {UserId}.", user.Id);
        return Unauthorized(new { message = InvalidCredentialsMessage });
      }

      if (isLockedOut)
      {
        _logger.LogWarning("Login blocked for locked-out user {UserId}.", user.Id);
        return Unauthorized(new { message = InvalidCredentialsMessage });
      }

      if (!passwordValid)
      {
        user.AccessFailedCount++;

        if (user.AccessFailedCount >= _lockoutSettings.MaxFailedAttempts)
        {
          user.LockoutEnd = now.AddMinutes(_lockoutSettings.DurationMinutes);
          user.AccessFailedCount = 0;

          _logger.LogWarning(
            "Account lockout triggered for user {UserId} from {IpAddress}.",
            user.Id,
            GetIpAddress());
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogWarning(
          "Login failed for user {UserId} from {IpAddress}.",
          user.Id,
          GetIpAddress());

        return Unauthorized(new { message = InvalidCredentialsMessage });
      }

      if (verification == PasswordVerificationResult.SuccessRehashNeeded)
      {
        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);
      }

      user.AccessFailedCount = 0;
      user.LockoutEnd = null;
      user.LastLoginAt = now;

      await _dbContext.SaveChangesAsync(cancellationToken);

      var existingToken = Request.Cookies[_refreshTokenCookieService.CookieName];
      if (!string.IsNullOrWhiteSpace(existingToken))
      {
        await _refreshTokenService.RevokeAsync(
          existingToken,
          RefreshTokenRevocationReasons.Login,
          cancellationToken);
      }

      var session = await _refreshTokenService.CreateAsync(
        user,
        GetIpAddress(),
        GetUserAgent(),
        cancellationToken);

      _refreshTokenCookieService.Append(Response, session.RawToken, session.ExpiresAt);

      var accessToken = _jwtService.GenerateToken(user, session.FamilyId);

      _logger.LogInformation(
        "User {UserId} logged in. Session {FamilyId}.",
        user.Id,
        session.FamilyId);

      return Ok(new AuthResponse
      {
        AccessToken = accessToken.Token,
        ExpiresAt = accessToken.ExpiresAt,
        User = user.ToUserDto()
      });
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    [EnableRateLimiting(RateLimitPolicies.Refresh)]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Refresh(CancellationToken cancellationToken)
    {
      if (!IsAllowedOrigin())
      {
        return StatusCode(StatusCodes.Status403Forbidden);
      }

      var rawToken = Request.Cookies[_refreshTokenCookieService.CookieName];
      if (string.IsNullOrWhiteSpace(rawToken))
      {
        _refreshTokenCookieService.Delete(Response);
        return Unauthorized();
      }

      var rotation = await _refreshTokenService.RotateAsync(
        rawToken,
        GetIpAddress(),
        GetUserAgent(),
        cancellationToken);

      if (rotation.Status == RefreshTokenRotationStatus.ReusedGrace)
      {
        // The winning request already set a fresh cookie. Ask the client to
        // retry once with the newer cookie instead of treating this as a
        // definitive logout.
        Response.Headers["X-Refresh-Retry"] = "1";
        return Unauthorized();
      }

      if (rotation.Status != RefreshTokenRotationStatus.Success
        || rotation.RawToken is null
        || rotation.ExpiresAt is null
        || rotation.User is null
        || rotation.FamilyId is null)
      {
        _refreshTokenCookieService.Delete(Response);
        return Unauthorized();
      }

      _refreshTokenCookieService.Append(
        Response,
        rotation.RawToken,
        rotation.ExpiresAt.Value);

      var accessToken = _jwtService.GenerateToken(
        rotation.User,
        rotation.FamilyId.Value);

      return Ok(new AuthResponse
      {
        AccessToken = accessToken.Token,
        ExpiresAt = accessToken.ExpiresAt,
        User = rotation.User.ToUserDto()
      });
    }

    [HttpPost("logout")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
      if (!IsAllowedOrigin())
      {
        return StatusCode(StatusCodes.Status403Forbidden);
      }

      var rawToken = Request.Cookies[_refreshTokenCookieService.CookieName];

      await _refreshTokenService.RevokeAsync(
        rawToken,
        RefreshTokenRevocationReasons.Logout,
        cancellationToken);

      _refreshTokenCookieService.Delete(Response);

      return NoContent();
    }

    [HttpPost("logout-all")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> LogoutAll(CancellationToken cancellationToken)
    {
      var userId = _currentUserService.GetCurrentUserId();
      if (!userId.HasValue)
      {
        return Unauthorized();
      }

      await _refreshTokenService.RevokeAllForUserAsync(
        userId.Value,
        RefreshTokenRevocationReasons.LogoutAll,
        cancellationToken);

      _refreshTokenCookieService.Delete(Response);

      _logger.LogInformation("All sessions revoked for user {UserId}.", userId.Value);

      return NoContent();
    }

    [HttpPost("change-password")]
    [Authorize]
    [EnableRateLimiting(RateLimitPolicies.PasswordChange)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ChangePassword(
      [FromBody] ChangePasswordRequest request,
      [FromServices] ChangePasswordRequestValidator validator,
      CancellationToken cancellationToken)
    {
      var validationResult = await validator.ValidateAsync(request, cancellationToken);
      if (!validationResult.IsValid)
      {
        return ValidationProblemFrom(validationResult);
      }

      var userId = _currentUserService.GetCurrentUserId();
      if (!userId.HasValue)
      {
        return Unauthorized();
      }

      var user = await _dbContext.Users.FindAsync(
        new object?[] { userId.Value },
        cancellationToken);

      if (user is null || !user.IsActive)
      {
        return Unauthorized();
      }

      var verification = _passwordHasher.VerifyHashedPassword(
        user,
        user.PasswordHash,
        request.CurrentPassword);

      if (verification == PasswordVerificationResult.Failed)
      {
        _logger.LogWarning(
          "Password change rejected for user {UserId}: current password incorrect.",
          user.Id);

        return BadRequest(new { message = "Current password is incorrect." });
      }

      var newPasswordHash = _passwordHasher.HashPassword(user, request.NewPassword);

      await using var transaction = await _dbContext.Database
        .BeginTransactionAsync(cancellationToken);

      user.PasswordHash = newPasswordHash;
      user.AccessFailedCount = 0;
      user.LockoutEnd = null;

      await _dbContext.SaveChangesAsync(cancellationToken);

      await _refreshTokenService.RevokeAllForUserAsync(
        user.Id,
        RefreshTokenRevocationReasons.PasswordChanged,
        cancellationToken);

      await transaction.CommitAsync(cancellationToken);

      _refreshTokenCookieService.Delete(Response);

      _logger.LogInformation(
        "Password changed for user {UserId}. All sessions revoked.",
        user.Id);

      return NoContent();
    }

    [HttpGet("sessions")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<SessionResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetSessions(CancellationToken cancellationToken)
    {
      var userId = _currentUserService.GetCurrentUserId();
      if (!userId.HasValue)
      {
        return Unauthorized();
      }

      var sessions = await _refreshTokenService.GetSessionsAsync(
        userId.Value,
        _currentUserService.GetCurrentSessionId(),
        cancellationToken);

      var response = sessions.Select(session => new SessionResponse
      {
        Id = session.Id,
        CreatedAt = session.CreatedAt,
        LastUsedAt = session.LastUsedAt,
        ExpiresAt = session.ExpiresAt,
        IpAddress = session.IpAddress,
        UserAgent = session.UserAgent,
        IsCurrent = session.IsCurrent
      });

      return Ok(response);
    }

    [HttpDelete("sessions/{familyId:guid}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RevokeSession(
      Guid familyId,
      CancellationToken cancellationToken)
    {
      var userId = _currentUserService.GetCurrentUserId();
      if (!userId.HasValue)
      {
        return Unauthorized();
      }

      await _refreshTokenService.RevokeFamilyAsync(
        familyId,
        userId.Value,
        RefreshTokenRevocationReasons.SessionRevoked,
        cancellationToken);

      if (familyId == _currentUserService.GetCurrentSessionId())
      {
        _refreshTokenCookieService.Delete(Response);
      }

      return NoContent();
    }

    private IActionResult ValidationProblemFrom(ValidationResult validationResult)
    {
      var modelState = new ModelStateDictionary();

      foreach (var error in validationResult.Errors)
      {
        modelState.AddModelError(error.PropertyName, error.ErrorMessage);
      }

      return ValidationProblem(modelState);
    }

    private string? GetIpAddress()
    {
      return HttpContext.Connection.RemoteIpAddress?.ToString();
    }

    private string? GetUserAgent()
    {
      return Request.Headers.UserAgent.ToString();
    }

    private bool IsAllowedOrigin()
    {
      var origin = Request.Headers.Origin.ToString();

      if (string.IsNullOrWhiteSpace(origin))
      {
        var referer = Request.Headers.Referer.ToString();
        if (string.IsNullOrWhiteSpace(referer))
        {
          // Non-browser clients do not send Origin/Referer. CSRF is a browser
          // attack, and the refresh cookie is SameSite=Strict.
          return true;
        }

        if (!Uri.TryCreate(referer, UriKind.Absolute, out var refererUri))
        {
          return false;
        }

        origin = refererUri.GetLeftPart(UriPartial.Authority);
      }

      var requestOrigin = $"{Request.Scheme}://{Request.Host}";
      if (string.Equals(origin, requestOrigin, StringComparison.OrdinalIgnoreCase))
      {
        return true;
      }

      return _corsSettings.AllowedOrigins.Contains(origin, StringComparer.OrdinalIgnoreCase);
    }
  }
}
