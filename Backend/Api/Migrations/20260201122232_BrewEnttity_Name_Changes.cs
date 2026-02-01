using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class BrewEnttity_Name_Changes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "OutputWeight",
                table: "Brews",
                newName: "BrewWeight");

            migrationBuilder.RenameColumn(
                name: "OutputTime",
                table: "Brews",
                newName: "BrewTime");

            migrationBuilder.RenameColumn(
                name: "OutputTasteScore",
                table: "Brews",
                newName: "BrewTasteScore");

            migrationBuilder.RenameColumn(
                name: "OutputAddedWeight",
                table: "Brews",
                newName: "BrewAddedWeight");

            migrationBuilder.RenameColumn(
                name: "OutputAddedTasteScore",
                table: "Brews",
                newName: "BrewAddedWeightTasteScore");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "BrewWeight",
                table: "Brews",
                newName: "OutputWeight");

            migrationBuilder.RenameColumn(
                name: "BrewTime",
                table: "Brews",
                newName: "OutputTime");

            migrationBuilder.RenameColumn(
                name: "BrewTasteScore",
                table: "Brews",
                newName: "OutputTasteScore");

            migrationBuilder.RenameColumn(
                name: "BrewAddedWeightTasteScore",
                table: "Brews",
                newName: "OutputAddedTasteScore");

            migrationBuilder.RenameColumn(
                name: "BrewAddedWeight",
                table: "Brews",
                newName: "OutputAddedWeight");
        }
    }
}
