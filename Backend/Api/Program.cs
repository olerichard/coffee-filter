
using Api.Database;
using Api.Database.Entities;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Scalar.AspNetCore;
using System.Runtime.InteropServices;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Api.Features.Core.Auth;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();
// Add services to the container.

// Configure DbContext with connection string from appsettings
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        builder =>
        {
            builder.WithOrigins("http://127.0.0.1:3000")
                   .AllowAnyHeader()
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

builder.Services.AddControllers() .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
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

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

// Create database directory with proper permissions and apply migrations
CreateDatabaseDirectoryWithPermissions();

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

void CreateDatabaseDirectoryWithPermissions()
{
    var dbPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), ".database");
    
    if (!Directory.Exists(dbPath))
    {
        Directory.CreateDirectory(dbPath);
        
        // Set proper permissions on Unix-like systems
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux) || RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
        {
            try
            {
                var chmod = new System.Diagnostics.Process
                {
                    StartInfo = new System.Diagnostics.ProcessStartInfo
                    {
                        FileName = "chmod",
                        Arguments = "755 " + dbPath,
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        UseShellExecute = false,
                        CreateNoWindow = true
                    }
                };
                chmod.Start();
                chmod.WaitForExit();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Warning: Could not set directory permissions: {ex.Message}");
            }
        }
    }
}
