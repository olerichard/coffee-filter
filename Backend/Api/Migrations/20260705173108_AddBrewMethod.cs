using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class AddBrewMethod : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BrewType",
                table: "Brews");

            migrationBuilder.AddColumn<int>(
                name: "BrewMethodId",
                table: "Brews",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "BrewMethods",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    DoseMax = table.Column<double>(type: "REAL", nullable: false),
                    DoseMin = table.Column<double>(type: "REAL", nullable: false),
                    DoseDefault = table.Column<double>(type: "REAL", nullable: false),
                    GrindSizeMax = table.Column<double>(type: "REAL", nullable: false),
                    GrindSizeMin = table.Column<double>(type: "REAL", nullable: false),
                    GrindSizeDefault = table.Column<double>(type: "REAL", nullable: false),
                    BrewTimeMax = table.Column<int>(type: "INTEGER", nullable: false),
                    BrewTimeMin = table.Column<int>(type: "INTEGER", nullable: false),
                    BrewTimeDefault = table.Column<int>(type: "INTEGER", nullable: false),
                    BrewWeightMax = table.Column<double>(type: "REAL", nullable: false),
                    BrewWeightMin = table.Column<double>(type: "REAL", nullable: false),
                    BrewWeightDefault = table.Column<double>(type: "REAL", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedOn = table.Column<string>(type: "TEXT", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "TEXT", nullable: true),
                    LastModifiedOn = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BrewMethods", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Brews_BrewMethodId",
                table: "Brews",
                column: "BrewMethodId");

            migrationBuilder.AddForeignKey(
                name: "FK_Brews_BrewMethods_BrewMethodId",
                table: "Brews",
                column: "BrewMethodId",
                principalTable: "BrewMethods",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Brews_BrewMethods_BrewMethodId",
                table: "Brews");

            migrationBuilder.DropTable(
                name: "BrewMethods");

            migrationBuilder.DropIndex(
                name: "IX_Brews_BrewMethodId",
                table: "Brews");

            migrationBuilder.DropColumn(
                name: "BrewMethodId",
                table: "Brews");

            migrationBuilder.AddColumn<string>(
                name: "BrewType",
                table: "Brews",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }
    }
}
