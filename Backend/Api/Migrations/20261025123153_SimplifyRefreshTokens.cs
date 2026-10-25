using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class SimplifyRefreshTokens : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM \"RefreshTokens\" WHERE \"RevokedAt\" IS NOT NULL;");

            migrationBuilder.DropIndex(
                name: "IX_RefreshTokens_FamilyId",
                table: "RefreshTokens");

            migrationBuilder.DropIndex(
                name: "IX_RefreshTokens_UserId_FamilyId",
                table: "RefreshTokens");

            migrationBuilder.DropColumn(
                name: "FamilyExpiresAt",
                table: "RefreshTokens");

            migrationBuilder.DropColumn(
                name: "FamilyId",
                table: "RefreshTokens");

            migrationBuilder.DropColumn(
                name: "ReplacedByTokenHash",
                table: "RefreshTokens");

            migrationBuilder.DropColumn(
                name: "RevokedAt",
                table: "RefreshTokens");

            migrationBuilder.DropColumn(
                name: "RevokedReason",
                table: "RefreshTokens");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_UserId",
                table: "RefreshTokens",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RefreshTokens_UserId",
                table: "RefreshTokens");

            migrationBuilder.AddColumn<string>(
                name: "FamilyExpiresAt",
                table: "RefreshTokens",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "FamilyId",
                table: "RefreshTokens",
                type: "TEXT",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "ReplacedByTokenHash",
                table: "RefreshTokens",
                type: "TEXT",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RevokedAt",
                table: "RefreshTokens",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RevokedReason",
                table: "RefreshTokens",
                type: "TEXT",
                maxLength: 32,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_FamilyId",
                table: "RefreshTokens",
                column: "FamilyId");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_UserId_FamilyId",
                table: "RefreshTokens",
                columns: new[] { "UserId", "FamilyId" });
        }
    }
}
