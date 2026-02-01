using Api.Database.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Api.Database
{
    public static class SeedData
    {
        public static async Task InitializeAsync(AppDbContext context)
        {
            // Ensure database is created
            await context.Database.EnsureCreatedAsync();

            // Check if data already exists
            if (await context.Users.AnyAsync() || await context.CoffeeBags.AnyAsync() || await context.Brews.AnyAsync())
            {
                return; // Database has been seeded
            }

            // Create Ole user first
            var passwordHasher = new PasswordHasher<UserEntity>();
            var oleUser = new UserEntity
            {
                Username = "ole",
                Email = "ole@coffee-filter.local",
                DisplayName = "Ole",
                IsActive = true,
                PasswordHash = passwordHasher.HashPassword(null!, "coffee")
            };
          
            context.Users.Add(oleUser);
            await context.SaveChangesAsync();

            // Seed Coffee Bags with Ole as owner
            var coffeeBags = new List<CoffeeBagEntity>
            {
                new() { UserId = oleUser.Id, Roaster = "Blue Bottle Coffee", Origin = "Ethiopia", RoastStyle = "Light", FlavourNotes = "Blueberry, jasmine, bergamot", Opened = DateTime.Now.AddDays(-10) },
                new() { UserId = oleUser.Id, Roaster = "Stumptown Coffee Roasters", Origin = "Colombia", RoastStyle = "Medium-Light", FlavourNotes = "Chocolate, caramel, citrus", Opened = DateTime.Now.AddDays(-5) },
                new() { UserId = oleUser.Id, Roaster = "Intelligentsia Coffee", Origin = "Brazil", RoastStyle = "Medium", FlavourNotes = "Nuts, chocolate, vanilla", Opened = DateTime.Now.AddDays(-7) },
                new() { UserId = oleUser.Id, Roaster = "Counter Culture Coffee", Origin = "Kenya", RoastStyle = "Light", FlavourNotes = "Blackcurrant, grapefruit, brown sugar", Opened = DateTime.Now.AddDays(-3) },
                new() { UserId = oleUser.Id, Roaster = "Ritual Coffee Roasters", Origin = "Guatemala", RoastStyle = "Medium-Dark", FlavourNotes = "Dark chocolate, spice, toasted nuts", Opened = DateTime.Now.AddDays(-8) },
                new() { UserId = oleUser.Id, Roaster = "Onyx Coffee Lab", Origin = "Panama", RoastStyle = "Light", FlavourNotes = "Tropical fruit, honey, floral", Opened = DateTime.Now.AddDays(-2) },
                new() { UserId = oleUser.Id, Roaster = "Heart Coffee Roasters", Origin = "Rwanda", RoastStyle = "Medium", FlavourNotes = "Red apple, cinnamon, caramel", Opened = DateTime.Now.AddDays(-6) },
                new() { UserId = oleUser.Id, Roaster = "George Howell Coffee", Origin = "Costa Rica", RoastStyle = "Light", FlavourNotes = "Lemon, honey, almond", Opened = DateTime.Now.AddDays(-4) },
                new() { UserId = oleUser.Id, Roaster = "Tim Wendelboe", Origin = "Ethiopia", RoastStyle = "Light", FlavourNotes = "Peach, jasmine, tea", Opened = DateTime.Now.AddDays(-1) },
                new() { UserId = oleUser.Id, Roaster = "The Coffee Collective", Origin = "Nicaragua", RoastStyle = "Medium", FlavourNotes = "Chocolate, nuts, stone fruit", Opened = DateTime.Now.AddDays(-9) },
                new() { UserId = oleUser.Id, Roaster = "Square Mile Coffee Roasters", Origin = "Burundi", RoastStyle = "Light", FlavourNotes = "Red berries, floral, caramel", Opened = DateTime.Now.AddDays(-11) },
                new() { UserId = oleUser.Id, Roaster = "Has Bean Coffee", Origin = "Indonesia", RoastStyle = "Dark", FlavourNotes = "Dark chocolate, earth, spice", Opened = DateTime.Now.AddDays(-13) },
                new() { UserId = oleUser.Id, Roaster = "Coffee Supreme", Origin = "Honduras", RoastStyle = "Medium", FlavourNotes = "Caramel, apple, nuts", Opened = DateTime.Now.AddDays(-15) },
                new() { UserId = oleUser.Id, Roaster = "Allpress Espresso", Origin = "Peru", RoastStyle = "Medium-Dark", FlavourNotes = "Chocolate, orange, nuts", Opened = DateTime.Now.AddDays(-12) },
                new() { UserId = oleUser.Id, Roaster = "Toby's Estate", Origin = "Ethiopia", RoastStyle = "Light", FlavourNotes = "Lemon, floral, tea", Opened = DateTime.Now.AddDays(-14) },
                new() { UserId = oleUser.Id, Roaster = "Blue Bottle Coffee", Origin = "Sumatra", RoastStyle = "Dark", FlavourNotes = "Earth, cedar, dark chocolate", Opened = DateTime.Now.AddDays(-16) },
                new() { UserId = oleUser.Id, Roaster = "Stumptown Coffee Roasters", Origin = "Mexico", RoastStyle = "Medium", FlavourNotes = "Chocolate, nuts, spice", Opened = DateTime.Now.AddDays(-17) },
                new() { UserId = oleUser.Id, Roaster = "Intelligentsia Coffee", Origin = "Tanzania", RoastStyle = "Light", FlavourNotes = "Blackberry, lime, floral", Opened = DateTime.Now.AddDays(-18) },
                new() { UserId = oleUser.Id, Roaster = "Counter Culture Coffee", Origin = "El Salvador", RoastStyle = "Medium-Light", FlavourNotes = "Chocolate, cherry, nuts", Opened = DateTime.Now.AddDays(-19) }
            };

            await context.CoffeeBags.AddRangeAsync(coffeeBags);
            await context.SaveChangesAsync();

            // Seed Brew Records
            var brews = new List<BrewEntity>
            {
                new() { UserId = oleUser.Id, CoffeeBagId = 1, BrewType = "V60", CoffeeDose = 18.0, GrindSize = 3.5, BrewTime = 240, BrewWeight = 300.0, BrewTasteScore = 4, Notes = "Great balance, bright acidity" },
                new() { UserId = oleUser.Id, CoffeeBagId = 1, BrewType = "AeroPress", CoffeeDose = 16.0, GrindSize = 4.0, BrewTime = 120, BrewWeight = 200.0, BrewTasteScore = 3, Notes = "Smooth, less acidity" },
                new() { UserId = oleUser.Id, CoffeeBagId = 2, BrewType = "French Press", CoffeeDose = 20.0, GrindSize = 6.0, BrewTime = 300, BrewWeight = 350.0, BrewTasteScore = 4, Notes = "Full body, rich flavor" },
                new() { UserId = oleUser.Id, CoffeeBagId = 2, BrewType = "Espresso", CoffeeDose = 18.0, GrindSize = 2.0, BrewTime = 25, BrewWeight = 36.0, BrewTasteScore = 5, Notes = "Perfect extraction, creamy" },
                new() { UserId = oleUser.Id, CoffeeBagId = 3, BrewType = "Chemex", CoffeeDose = 22.0, GrindSize = 4.5, BrewTime = 270, BrewWeight = 400.0, BrewTasteScore = 3, Notes = "Clean, smooth finish" },
                new() { UserId = oleUser.Id, CoffeeBagId = 3, BrewType = "Kalita Wave", CoffeeDose = 17.0, GrindSize = 3.8, BrewTime = 210, BrewWeight = 280.0, BrewTasteScore = 4, Notes = "Consistent extraction" },
                new() { UserId = oleUser.Id, CoffeeBagId = 4, BrewType = "Clever Dripper", CoffeeDose = 19.0, GrindSize = 4.2, BrewTime = 180, BrewWeight = 250.0, BrewTasteScore = 4, Notes = "Bright, complex flavors" },
                new() { UserId = oleUser.Id, CoffeeBagId = 4, BrewType = "Moka Pot", CoffeeDose = 15.0, GrindSize = 3.0, BrewTime = 90, BrewWeight = 120.0, BrewTasteScore = 2, Notes = "Strong, slightly bitter" },
                new() { UserId = oleUser.Id, CoffeeBagId = 5, BrewType = "Cold Brew", CoffeeDose = 25.0, GrindSize = 7.0, BrewTime = 7200, BrewWeight = 300.0, BrewTasteScore = 3, Notes = "Smooth, low acidity" },
                new() { UserId = oleUser.Id, CoffeeBagId = 5, BrewType = "Turkish Coffee", CoffeeDose = 8.0, GrindSize = 10.0, BrewTime = 120, BrewWeight = 60.0, BrewTasteScore = 3, Notes = "Strong, thick texture" },
                new() { UserId = oleUser.Id, CoffeeBagId = 6, BrewType = "V60", CoffeeDose = 18.0, GrindSize = 3.2, BrewTime = 225, BrewWeight = 300.0, BrewTasteScore = 5, Notes = "Exceptional clarity, floral notes" },
                new() { UserId = oleUser.Id, CoffeeBagId = 6, BrewType = "AeroPress", CoffeeDose = 17.0, GrindSize = 3.8, BrewTime = 105, BrewWeight = 200.0, BrewTasteScore = 4, Notes = "Smooth, tropical fruit forward" },
                new() { UserId = oleUser.Id, CoffeeBagId = 7, BrewType = "French Press", CoffeeDose = 21.0, GrindSize = 5.8, BrewTime = 285, BrewWeight = 350.0, BrewTasteScore = 3, Notes = "Rich, spicy finish" },
                new() { UserId = oleUser.Id, CoffeeBagId = 7, BrewType = "Espresso", CoffeeDose = 18.5, GrindSize = 1.8, BrewTime = 28, BrewWeight = 36.0, BrewTasteScore = 4, Notes = "Good crema, balanced" },
                new() { UserId = oleUser.Id, CoffeeBagId = 8, BrewType = "Chemex", CoffeeDose = 23.0, GrindSize = 4.3, BrewTime = 265, BrewWeight = 400.0, BrewTasteScore = 4, Notes = "Bright, clean cup" },
                new() { UserId = oleUser.Id, CoffeeBagId = 8, BrewType = "Kalita Wave", CoffeeDose = 16.5, GrindSize = 3.6, BrewTime = 205, BrewWeight = 280.0, BrewTasteScore = 3, Notes = "Mellow, honey notes" },
                new() { UserId = oleUser.Id, CoffeeBagId = 9, BrewType = "Clever Dripper", CoffeeDose = 18.5, GrindSize = 4.0, BrewTime = 175, BrewWeight = 250.0, BrewTasteScore = 5, Notes = "Outstanding complexity" },
                new() { UserId = oleUser.Id, CoffeeBagId = 9, BrewType = "V60", CoffeeDose = 17.5, GrindSize = 3.3, BrewTime = 230, BrewWeight = 300.0, BrewTasteScore = 4, Notes = "Tea-like finish" },
                new() { UserId = oleUser.Id, CoffeeBagId = 10, BrewType = "French Press", CoffeeDose = 20.5, GrindSize = 5.5, BrewTime = 295, BrewWeight = 350.0, BrewTasteScore = 3, Notes = "Full-bodied, sweet" },
                new() { UserId = oleUser.Id, CoffeeBagId = 10, BrewType = "AeroPress", CoffeeDose = 16.0, GrindSize = 3.9, BrewTime = 115, BrewWeight = 200.0, BrewTasteScore = 4, Notes = "Smooth, caramel notes" },
                new() { UserId = oleUser.Id, CoffeeBagId = 11, BrewType = "V60", CoffeeDose = 18.2, GrindSize = 3.4, BrewTime = 235, BrewWeight = 300.0, BrewTasteScore = 4, Notes = "Fruity, bright acidity" },
                new() { UserId = oleUser.Id, CoffeeBagId = 11, BrewType = "Chemex", CoffeeDose = 22.5, GrindSize = 4.4, BrewTime = 275, BrewWeight = 400.0, BrewTasteScore = 3, Notes = "Clean, balanced" },
                new() { UserId = oleUser.Id, CoffeeBagId = 12, BrewType = "French Press", CoffeeDose = 19.5, GrindSize = 6.2, BrewTime = 310, BrewWeight = 350.0, BrewTasteScore = 2, Notes = "Very rich, heavy body" },
                new() { UserId = oleUser.Id, CoffeeBagId = 12, BrewType = "Moka Pot", CoffeeDose = 14.5, GrindSize = 2.8, BrewTime = 85, BrewWeight = 120.0, BrewTasteScore = 2, Notes = "Intense, earthy" },
                new() { UserId = oleUser.Id, CoffeeBagId = 13, BrewType = "V60", CoffeeDose = 17.8, GrindSize = 3.6, BrewTime = 245, BrewWeight = 300.0, BrewTasteScore = 4, Notes = "Sweet, nutty finish" },
                new() { UserId = oleUser.Id, CoffeeBagId = 13, BrewType = "Kalita Wave", CoffeeDose = 17.2, GrindSize = 3.7, BrewTime = 215, BrewWeight = 280.0, BrewTasteScore = 3, Notes = "Consistent, mellow" },
                new() { UserId = oleUser.Id, CoffeeBagId = 14, BrewType = "AeroPress", CoffeeDose = 16.8, GrindSize = 4.1, BrewTime = 110, BrewWeight = 200.0, BrewTasteScore = 4, Notes = "Smooth, chocolate notes" },
                new() { UserId = oleUser.Id, CoffeeBagId = 14, BrewType = "Espresso", CoffeeDose = 18.8, GrindSize = 1.9, BrewTime = 27, BrewWeight = 36.0, BrewTasteScore = 4, Notes = "Good balance, orange notes" },
                new() { UserId = oleUser.Id, CoffeeBagId = 15, BrewType = "V60", CoffeeDose = 17.3, GrindSize = 3.1, BrewTime = 220, BrewWeight = 300.0, BrewTasteScore = 5, Notes = "Exceptional floral notes" },
                new() { UserId = oleUser.Id, CoffeeBagId = 16, BrewType = "Cold Brew", CoffeeDose = 24.5, GrindSize = 7.2, BrewTime = 7300, BrewWeight = 300.0, BrewTasteScore = 3, Notes = "Smooth, rich body" },
                new() { UserId = oleUser.Id, CoffeeBagId = 17, BrewType = "V60", CoffeeDose = 18.5, GrindSize = 3.7, BrewTime = 250, BrewWeight = 300.0, BrewTasteScore = 3, Notes = "Spicy, chocolate notes" },
                new() { UserId = oleUser.Id, CoffeeBagId = 17, BrewType = "AeroPress", CoffeeDose = 16.3, GrindSize = 4.3, BrewTime = 125, BrewWeight = 200.0, BrewTasteScore = 4, Notes = "Smooth, well-balanced" },
                new() { UserId = oleUser.Id, CoffeeBagId = 18, BrewType = "Kalita Wave", CoffeeDose = 16.8, GrindSize = 3.5, BrewTime = 200, BrewWeight = 280.0, BrewTasteScore = 5, Notes = "Bright, complex acidity" },
                new() { UserId = oleUser.Id, CoffeeBagId = 18, BrewType = "Chemex", CoffeeDose = 23.2, GrindSize = 4.1, BrewTime = 260, BrewWeight = 400.0, BrewTasteScore = 4, Notes = "Clean, vibrant" },
                new() { UserId = oleUser.Id, CoffeeBagId = 19, BrewType = "V60", CoffeeDose = 17.6, GrindSize = 3.0, BrewTime = 215, BrewWeight = 300.0, BrewTasteScore = 4, Notes = "Cherry, lime forward" },
                new() { UserId = oleUser.Id, CoffeeBagId = 19, BrewType = "French Press", CoffeeDose = 21.2, GrindSize = 5.7, BrewTime = 290, BrewWeight = 350.0, BrewTasteScore = 3, Notes = "Rich, berry notes" },
                new() { UserId = oleUser.Id, CoffeeBagId = 19, BrewType = "AeroPress", CoffeeDose = 16.5, GrindSize = 3.9, BrewTime = 108, BrewWeight = 200.0, BrewTasteScore = 4, Notes = "Smooth, chocolate cherry" },
                new() { UserId = oleUser.Id, CoffeeBagId = 19, BrewType = "Espresso", CoffeeDose = 18.2, GrindSize = 2.1, BrewTime = 30, BrewWeight = 36.0, BrewTasteScore = 1, Notes = "Over-extracted, bitter" }
            };

            await context.Brews.AddRangeAsync(brews);
            await context.SaveChangesAsync();
        }
    }
}