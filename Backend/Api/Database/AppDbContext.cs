using Api.Database.Entities;
using Api.Features.Brewing;
using Microsoft.EntityFrameworkCore;

namespace Api.Database
{
  public class AppDbContext : DbContext
  {
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Brew> Brews { get; set; } = null!;
    public DbSet<CoffeeBag> CoffeeBags { get; set; } = null!;
  
  }
}
