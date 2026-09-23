using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class RenameUserGrindersToUserEquipment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserGrinders");

            migrationBuilder.CreateTable(
                name: "UserEquipment",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    GrinderModelId = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedOn = table.Column<string>(type: "TEXT", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "TEXT", nullable: true),
                    LastModifiedOn = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserEquipment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserEquipment_GrinderModels_GrinderModelId",
                        column: x => x.GrinderModelId,
                        principalTable: "GrinderModels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserEquipment_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserEquipment_GrinderModelId",
                table: "UserEquipment",
                column: "GrinderModelId");

            migrationBuilder.CreateIndex(
                name: "IX_UserEquipment_UserId",
                table: "UserEquipment",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserEquipment_UserId_GrinderModelId",
                table: "UserEquipment",
                columns: new[] { "UserId", "GrinderModelId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserEquipment");

            migrationBuilder.CreateTable(
                name: "UserGrinders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    GrinderModelId = table.Column<int>(type: "INTEGER", nullable: false),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedOn = table.Column<string>(type: "TEXT", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "TEXT", nullable: true),
                    LastModifiedOn = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserGrinders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserGrinders_GrinderModels_GrinderModelId",
                        column: x => x.GrinderModelId,
                        principalTable: "GrinderModels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserGrinders_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserGrinders_GrinderModelId",
                table: "UserGrinders",
                column: "GrinderModelId");

            migrationBuilder.CreateIndex(
                name: "IX_UserGrinders_UserId",
                table: "UserGrinders",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserGrinders_UserId_GrinderModelId",
                table: "UserGrinders",
                columns: new[] { "UserId", "GrinderModelId" },
                unique: true);
        }
    }
}
