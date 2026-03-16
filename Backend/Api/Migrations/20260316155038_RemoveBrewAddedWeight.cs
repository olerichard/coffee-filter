using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveBrewAddedWeight : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BrewAddedWeight",
                table: "Brews");

            migrationBuilder.DropColumn(
                name: "BrewAddedWeightTasteScore",
                table: "Brews");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "BrewAddedWeight",
                table: "Brews",
                type: "REAL",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BrewAddedWeightTasteScore",
                table: "Brews",
                type: "INTEGER",
                nullable: true);
        }
    }
}
