using Api.Features.Brewing;
using Microsoft.EntityFrameworkCore;

namespace Api.Database
{
  public class AppDbContext : DbContext
  {
   
    public string DbPath { get; }

    public AppDbContext()
    {
      var folder = Environment.SpecialFolder.LocalApplicationData;
      var path = Environment.GetFolderPath(folder);
      DbPath = Path.Join(path, "AppDatabase.db");
    }

    public DbSet<Brew> Brews {get;set;}
    public DbSet<CoffeeBag> CoffeeBags {get;set;}

    // The following configures EF to create a Sqlite database file in the
    // special "local" folder for your platform.
    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlite($"Data Source={DbPath}");
  }
}
