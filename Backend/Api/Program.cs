
using Api.Database;
using Microsoft.EntityFrameworkCore;
using System.Runtime.InteropServices;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();
// Add services to the container.

// Configure DbContext with connection string from appsettings
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

// Create database directory with proper permissions and apply migrations
CreateDatabaseDirectoryWithPermissions();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    
    // Apply migrations (auto-apply strategy for both dev and production)
    await context.Database.MigrateAsync();
    
    // Apply seed data
    
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
