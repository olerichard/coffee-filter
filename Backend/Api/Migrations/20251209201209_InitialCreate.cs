using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CoffeeBags",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Roaster = table.Column<string>(type: "TEXT", nullable: false),
                    Origin = table.Column<string>(type: "TEXT", nullable: false),
                    RoastStyle = table.Column<string>(type: "TEXT", nullable: false),
                    FlavourNotes = table.Column<string>(type: "TEXT", nullable: true),
                    Opened = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Emptied = table.Column<DateTime>(type: "TEXT", nullable: true),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedOn = table.Column<DateTime>(type: "TEXT", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "TEXT", nullable: true),
                    LastModifiedOn = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CoffeeBags", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Brews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CoffeeBagId = table.Column<int>(type: "INTEGER", nullable: false),
                    BrewType = table.Column<string>(type: "TEXT", nullable: false),
                    CoffeeDose = table.Column<double>(type: "REAL", nullable: true),
                    GrindSize = table.Column<double>(type: "REAL", nullable: true),
                    OutputTime = table.Column<int>(type: "INTEGER", nullable: true),
                    OutputWeight = table.Column<double>(type: "REAL", nullable: true),
                    OutputTasteScore = table.Column<int>(type: "INTEGER", nullable: true),
                    OutputAddedWeight = table.Column<double>(type: "REAL", nullable: true),
                    OutputAddedTasteScore = table.Column<int>(type: "INTEGER", nullable: true),
                    Notes = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedOn = table.Column<DateTime>(type: "TEXT", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "TEXT", nullable: true),
                    LastModifiedOn = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Brews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Brews_CoffeeBags_CoffeeBagId",
                        column: x => x.CoffeeBagId,
                        principalTable: "CoffeeBags",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Brews_CoffeeBagId",
                table: "Brews",
                column: "CoffeeBagId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Brews");

            migrationBuilder.DropTable(
                name: "CoffeeBags");
        }
    }
}
