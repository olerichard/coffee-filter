using Api.Database.Entities;
using Microsoft.EntityFrameworkCore;

namespace Api.Database
{
  public class AppDbContext : DbContext
  {
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<UserEntity> Users { get; set; } = null!;
    public DbSet<BrewEntity> Brews { get; set; } = null!;
    public DbSet<CoffeeBagEntity> CoffeeBags { get; set; } = null!;

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
      // Enforce UTC for all DateTime properties globally.
      configurationBuilder.Properties<DateTime>().HaveConversion<UtcDateTimeValueConverter>();
      configurationBuilder.Properties<DateTime?>().HaveConversion<UtcNullableDateTimeValueConverter>();
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      base.OnModelCreating(modelBuilder);

      // Configure User entity
      modelBuilder.Entity<UserEntity>()
        .HasIndex(u => u.Username)
        .IsUnique();

      modelBuilder.Entity<UserEntity>()
        .HasIndex(u => u.Email)
        .IsUnique();

      // Configure User -> CoffeeBag relationship
      modelBuilder.Entity<CoffeeBagEntity>()
        .HasOne(cb => cb.User)
        .WithMany(u => u.CoffeeBags)
        .HasForeignKey(cb => cb.UserId)
        .OnDelete(DeleteBehavior.Cascade);

      // Configure User -> Brew relationship
      modelBuilder.Entity<BrewEntity>()
        .HasOne(b => b.User)
        .WithMany(u => u.Brews)
        .HasForeignKey(b => b.UserId)
        .OnDelete(DeleteBehavior.Cascade);

      // Maintain existing Brew -> CoffeeBag relationship
      modelBuilder.Entity<BrewEntity>()
        .HasOne(b => b.CoffeeBag)
        .WithMany(cb => cb.Brews)
        .HasForeignKey(b => b.CoffeeBagId)
        .OnDelete(DeleteBehavior.Cascade);
    }
  }
}
