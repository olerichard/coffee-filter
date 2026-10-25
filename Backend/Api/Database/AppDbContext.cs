using Api.Database.Entities;
using Microsoft.EntityFrameworkCore;

namespace Api.Database
{
  public class AppDbContext : DbContext
  {
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
      StampAuditFields();
      return await base.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Keeps the audit columns populated. Without this, CreatedOn/LastModifiedOn
    /// stay NULL for anything written through the API, which makes CreatedOn useless
    /// as a list-ordering tiebreaker for coffee bags.
    /// </summary>
    private void StampAuditFields()
    {
      var now = DateTime.UtcNow;

      foreach (var entry in ChangeTracker.Entries<AuditableEntity>())
      {
        switch (entry.State)
        {
          case EntityState.Added:
            // Preserve an explicitly supplied value, e.g. from SeedData.
            entry.Entity.CreatedOn ??= now;
            break;
          case EntityState.Modified:
            entry.Entity.LastModifiedOn = now;
            break;
        }
      }
    }

    public DbSet<UserEntity> Users { get; set; } = null!;
    public DbSet<BrewEntity> Brews { get; set; } = null!;
    public DbSet<CoffeeBagEntity> CoffeeBags { get; set; } = null!;
    public DbSet<BrewMethodEntity> BrewMethods { get; set; } = null!;
    public DbSet<GrinderModelEntity> GrinderModels { get; set; } = null!;
    public DbSet<UserEquipmentEntity> UserEquipment { get; set; } = null!;
    public DbSet<RefreshTokenEntity> RefreshTokens { get; set; } = null!;

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

      // Configure User -> UserEquipment relationship
      modelBuilder.Entity<UserEquipmentEntity>()
        .HasOne(ue => ue.User)
        .WithMany(u => u.UserEquipment)
        .HasForeignKey(ue => ue.UserId)
        .OnDelete(DeleteBehavior.Cascade);

      modelBuilder.Entity<UserEquipmentEntity>()
        .HasIndex(ue => ue.UserId);

      // Configure GrinderModel -> UserEquipment relationship (catalog data is restricted, not cascaded)
      modelBuilder.Entity<UserEquipmentEntity>()
        .HasOne(ue => ue.GrinderModel)
        .WithMany(g => g.UserEquipment)
        .HasForeignKey(ue => ue.GrinderModelId)
        .OnDelete(DeleteBehavior.Restrict);

      // One ownership row per user per grinder model
      modelBuilder.Entity<UserEquipmentEntity>()
        .HasIndex(ue => new { ue.UserId, ue.GrinderModelId })
        .IsUnique();

      // Refresh tokens are stored as hashes. The raw value only ever exists in
      // the client's HttpOnly cookie.
      modelBuilder.Entity<RefreshTokenEntity>(entity =>
      {
        entity.Property(t => t.TokenHash)
          .HasMaxLength(64)
          .IsRequired();

        entity.Property(t => t.ReplacedByTokenHash)
          .HasMaxLength(64);

        entity.Property(t => t.RevokedReason)
          .HasMaxLength(32);

        entity.Property(t => t.CreatedByIp)
          .HasMaxLength(45);

        entity.Property(t => t.UserAgent)
          .HasMaxLength(512);

        entity.HasIndex(t => t.TokenHash)
          .IsUnique();

        entity.HasIndex(t => new { t.UserId, t.FamilyId });
        entity.HasIndex(t => t.FamilyId);
        entity.HasIndex(t => t.ExpiresAt);

        entity.HasOne(t => t.User)
          .WithMany(u => u.RefreshTokens)
          .HasForeignKey(t => t.UserId)
          .OnDelete(DeleteBehavior.Cascade);
      });
    }
  }
}
