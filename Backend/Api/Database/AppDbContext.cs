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
    public DbSet<BrewMethodEntity> BrewMethods { get; set; } = null!;
    public DbSet<GrinderModelEntity> GrinderModels { get; set; } = null!;
    public DbSet<UserGrinderEntity> UserGrinders { get; set; } = null!;

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

      // Configure Brew -> BrewMethod relationship
      modelBuilder.Entity<BrewEntity>()
        .HasOne(b => b.BrewMethod)
        .WithMany()
        .HasForeignKey(b => b.BrewMethodId)
        .OnDelete(DeleteBehavior.Restrict);

      // Store grinder style as a string column
      modelBuilder.Entity<GrinderModelEntity>()
        .Property(g => g.Style)
        .HasConversion<string>();

      // Configure User -> UserGrinder relationship
      modelBuilder.Entity<UserGrinderEntity>()
        .HasOne(ug => ug.User)
        .WithMany(u => u.UserGrinders)
        .HasForeignKey(ug => ug.UserId)
        .OnDelete(DeleteBehavior.Cascade);

      modelBuilder.Entity<UserGrinderEntity>()
        .HasIndex(ug => ug.UserId);

      // Configure GrinderModel -> UserGrinder relationship (catalog data is restricted, not cascaded)
      modelBuilder.Entity<UserGrinderEntity>()
        .HasOne(ug => ug.GrinderModel)
        .WithMany(g => g.UserGrinders)
        .HasForeignKey(ug => ug.GrinderModelId)
        .OnDelete(DeleteBehavior.Restrict);

      // One ownership row per user per grinder model
      modelBuilder.Entity<UserGrinderEntity>()
        .HasIndex(ug => new { ug.UserId, ug.GrinderModelId })
        .IsUnique();
    }
  }
}
