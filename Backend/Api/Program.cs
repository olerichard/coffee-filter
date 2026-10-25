using Api.Core;
using Api.Core.Auth;
using Api.Database;
using Api.Database.Entities;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();
builder.Services.AddSingleton<TimeProvider>(TimeProvider.System);

builder.Services.AddOptions<JwtSettings>()
    .Bind(builder.Configuration.GetSection(JwtSettings.SectionName))
    .Validate(
        settings => !string.IsNullOrWhiteSpace(settings.SecretKey)
            && Encoding.UTF8.GetByteCount(settings.SecretKey) >= 32,
        "JwtSettings:SecretKey must be at least 32 bytes (256 bits).")
    .Validate(
        settings => !string.IsNullOrWhiteSpace(settings.Issuer),
        "JwtSettings:Issuer is required.")
    .Validate(
        settings => !string.IsNullOrWhiteSpace(settings.Audience),
        "JwtSettings:Audience is required.")
    .Validate(
        settings => settings.AccessTokenMinutes > 0,
        "JwtSettings:AccessTokenMinutes must be positive.")
    .Validate(
        settings => settings.RefreshTokenDays > 0,
        "JwtSettings:RefreshTokenDays must be positive.")
    .Validate(
        settings => !string.IsNullOrWhiteSpace(settings.RefreshCookieName),
        "JwtSettings:RefreshCookieName is required.")
    .ValidateOnStart();

builder.Services.AddOptions<LockoutSettings>()
    .Bind(builder.Configuration.GetSection(LockoutSettings.SectionName))
    .Validate(
        settings => settings.MaxFailedAttempts > 0,
        "Lockout:MaxFailedAttempts must be positive.")
    .Validate(
        settings => settings.DurationMinutes > 0,
        "Lockout:DurationMinutes must be positive.")
    .ValidateOnStart();

builder.Services.Configure<CorsSettings>(
    builder.Configuration.GetSection(CorsSettings.SectionName));

builder.Services.Configure<SignupSettings>(
    builder.Configuration.GetSection(SignupSettings.SectionName));

var corsSettings = builder.Configuration
    .GetSection(CorsSettings.SectionName)
    .Get<CorsSettings>() ?? new CorsSettings();

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;

    // The production app runs behind Caddy in Docker. The proxy container IP can
    // change, so trust forwarded headers from the Docker network instead of
    // hard-coding one proxy address.
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

// Resolve the SQLite file path once so the connection string and the
// directory creation below can never disagree.
var connectionString = ResolveConnectionString(builder.Configuration);
var databaseFilePath = new SqliteConnectionStringBuilder(connectionString).DataSource;

// Configure DbContext with connection string from appsettings
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(connectionString));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            // Without explicit origins, cross-origin access stays disabled.
            // Never combine AllowAnyOrigin with credentials.
            if (corsSettings.AllowedOrigins.Length == 0)
            {
                return;
            }

            policy.WithOrigins(corsSettings.AllowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer();

builder.Services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
    .Configure<IOptions<JwtSettings>>((options, jwtOptions) =>
    {
        var jwtSettings = jwtOptions.Value;
        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey))
        {
            KeyId = "coffee-filter"
        };

        options.MapInboundClaims = false;
        options.IncludeErrorDetails = builder.Environment.IsDevelopment();
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtSettings.Audience,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = signingKey,
            RequireExpirationTime = true,
            RequireSignedTokens = true,
            ClockSkew = TimeSpan.FromSeconds(30),
            ValidAlgorithms = [SecurityAlgorithms.HmacSha256],
            NameClaimType = JwtRegisteredClaimNames.Name
        };

        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = context =>
            {
                var sessionId = context.Principal?
                    .FindFirst(AuthClaimTypes.SessionId)?.Value;

                // Tokens issued before the refresh-token system have no session
                // claim and must not be accepted.
                if (!Guid.TryParse(sessionId, out _))
                {
                    context.Fail("Access token is missing a valid session identifier.");
                }

                return Task.CompletedTask;
            },
            OnAuthenticationFailed = context =>
            {
                var logger = context.HttpContext.RequestServices
                    .GetRequiredService<ILoggerFactory>()
                    .CreateLogger("JwtBearer");

                logger.LogWarning(
                    context.Exception,
                    "JWT authentication failed. Scheme={Scheme}.",
                    context.Scheme.Name);

                return Task.CompletedTask;
            },
            OnChallenge = context =>
            {
                var logger = context.HttpContext.RequestServices
                    .GetRequiredService<ILoggerFactory>()
                    .CreateLogger("JwtBearer");

                logger.LogWarning(
                    "JWT challenge. Error={Error}.",
                    context.Error);

                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddOptions<PasswordHasherOptions>()
    .Configure(options =>
    {
        options.CompatibilityMode = PasswordHasherCompatibilityMode.IdentityV3;
        options.IterationCount = 600_000;
    });

builder.Services.AddScoped<IPasswordHasher<UserEntity>, PasswordHasher<UserEntity>>();
builder.Services.AddSingleton<DummyPasswordHash>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IRefreshTokenService, RefreshTokenService>();
builder.Services.AddSingleton<RefreshTokenCookieService>();
builder.Services.AddHostedService<RefreshTokenCleanupService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddPolicy(RateLimitPolicies.Login, httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));

    options.AddPolicy(RateLimitPolicies.Refresh, httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 60,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));

    options.AddPolicy(RateLimitPolicies.PasswordChange, httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(15),
                QueueLimit = 0
            }));

    options.AddPolicy(RateLimitPolicies.Signup, httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(15),
                QueueLimit = 0
            }));
});

// Add FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<LoginRequestValidator>();

// Configure automatic validation
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.SuppressModelStateInvalidFilter = false;
});

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    // Always serialize DateTime as UTC (ISO 8601 with Z suffix)
    options.JsonSerializerOptions.Converters.Add(new UtcDateTimeConverter());
    // Serialize enums as camelCase strings (e.g. "espresso")
    options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter(System.Text.Json.JsonNamingPolicy.CamelCase));
});

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer<Api.OpenApi.BearerSecuritySchemeTransformer>();
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseForwardedHeaders();

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

// Redirect non-loopback hosts to HTTPS when an HTTPS endpoint is configured.
// Loopback traffic stays on HTTP so local development does not require a
// trusted development certificate.
app.UseWhen(
    context => !IsLoopbackHost(context.Request.Host.Host),
    branch => branch.UseHttpsRedirection());

app.UseCors("AllowReactApp");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

// Create database directory with proper permissions and apply migrations
CreateDatabaseDirectoryWithPermissions(databaseFilePath);

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    // Apply migrations (auto-apply strategy for both dev and production)
    await context.Database.MigrateAsync();

    var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<UserEntity>>();

    // Apply seed data
    await SeedData.InitializeAsync(context, app.Configuration, passwordHasher);
}

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();

string ResolveConnectionString(IConfiguration configuration)
{
    var configured = configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");

    // SQLite does not expand '~', so resolve it against the current user profile.
    // This keeps the database in a stable per-user location on any machine.
    var builder = new SqliteConnectionStringBuilder(configured);

    if (builder.DataSource.StartsWith('~'))
    {
        var userProfile = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
        builder.DataSource = Path.Combine(userProfile, builder.DataSource.TrimStart('~').TrimStart('/', '\\'));
    }

    if (string.IsNullOrWhiteSpace(builder.DataSource))
    {
        throw new InvalidOperationException("Connection string 'DefaultConnection' does not specify a data source.");
    }

    return builder.ToString();
}

void CreateDatabaseDirectoryWithPermissions(string databaseFilePath)
{
    var directory = Path.GetDirectoryName(databaseFilePath);

    if (string.IsNullOrEmpty(directory))
    {
        throw new InvalidOperationException($"Could not determine the directory for database file '{databaseFilePath}'.");
    }

    if (!Directory.Exists(directory))
    {
        Directory.CreateDirectory(directory);

        // Set proper permissions on Unix-like systems
        if (!OperatingSystem.IsWindows())
        {
            try
            {
                File.SetUnixFileMode(directory,
                    UnixFileMode.UserRead | UnixFileMode.UserWrite | UnixFileMode.UserExecute |
                    UnixFileMode.GroupRead | UnixFileMode.GroupExecute |
                    UnixFileMode.OtherRead | UnixFileMode.OtherExecute);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Warning: Could not set directory permissions: {ex.Message}");
            }
        }
    }
}

static bool IsLoopbackHost(string host) =>
    host.Equals("localhost", StringComparison.OrdinalIgnoreCase) ||
    (IPAddress.TryParse(host, out var address) && IPAddress.IsLoopback(address));
