
using Api.Database;
using Api.Database.Entities;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Scalar.AspNetCore;
using System.Runtime.InteropServices;
using System.Text;
using System.Net;
using Microsoft.Data.Sqlite;
using Microsoft.IdentityModel.Tokens;
using Api.Core.Auth;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();
// Add services to the container.

// Resolve the SQLite file path once so the connection string and the
// directory creation below can never disagree.
var connectionString = ResolveConnectionString(builder.Configuration);
var databaseFilePath = new SqliteConnectionStringBuilder(connectionString).DataSource;

// Configure DbContext with connection string from appsettings
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(connectionString));

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            if (allowedOrigins.Length > 0)
            {
                policy.WithOrigins(allowedOrigins);
            }

            policy.AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// Add authentication services
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwtSettings = builder.Configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");
        var secretKeyBytes = Encoding.UTF8.GetBytes(secretKey);

        options.IncludeErrorDetails = true;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwtSettings["Audience"],
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(secretKeyBytes)
        };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                var logger = context.HttpContext.RequestServices
                    .GetRequiredService<ILoggerFactory>()
                    .CreateLogger("JwtBearer");

                var keyFingerprint = Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(secretKeyBytes));

                logger.LogError(context.Exception,
                    "JWT authentication failed. Scheme={Scheme}. KeyFingerprint(SHA256)={KeyFingerprint}. AuthorizationHeader={AuthorizationHeader}",
                    context.Scheme.Name,
                    keyFingerprint,
                    context.Request.Headers.Authorization.ToString());

                return Task.CompletedTask;
            },
            OnChallenge = context =>
            {
                var logger = context.HttpContext.RequestServices
                    .GetRequiredService<ILoggerFactory>()
                    .CreateLogger("JwtBearer");

                logger.LogWarning(
                    "JWT challenge. Error={Error}. ErrorDescription={ErrorDescription}. AuthorizationHeader={AuthorizationHeader}",
                    context.Error,
                    context.ErrorDescription,
                    context.Request.Headers.Authorization.ToString());

                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                var logger = context.HttpContext.RequestServices
                    .GetRequiredService<ILoggerFactory>()
                    .CreateLogger("JwtBearer");

                logger.LogInformation(
                    "JWT token validated. Subject={Subject}. Name={Name}",
                    context.Principal?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value,
                    context.Principal?.FindFirst(JwtRegisteredClaimNames.Name)?.Value);

                return Task.CompletedTask;
            }
        };
    });

// Add password hasher and JWT service
builder.Services.AddScoped<IPasswordHasher<UserEntity>, PasswordHasher<UserEntity>>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

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

// Only enforce HTTPS for loopback clients. Requests arriving on the machine's LAN
// address stay on plain HTTP, which avoids untrusted dev-certificate warnings.
app.UseWhen(
    context => !IsLoopbackHost(context.Request.Host.Host),
    branch => branch.UseHttpsRedirection());
app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

// Create database directory with proper permissions and apply migrations
CreateDatabaseDirectoryWithPermissions(databaseFilePath);

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    
    // Apply migrations (auto-apply strategy for both dev and production)
    await context.Database.MigrateAsync();
    
    // Apply seed data
    await SeedData.InitializeAsync(context);
    
}

app.MapControllers();

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
