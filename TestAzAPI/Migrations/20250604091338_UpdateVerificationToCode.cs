using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TestAzAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateVerificationToCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "EmailVerificationTokenExpiry",
                table: "Users",
                newName: "VerificationCodeExpiry");

            migrationBuilder.RenameColumn(
                name: "EmailVerificationToken",
                table: "Users",
                newName: "VerificationCode");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "VerificationCodeExpiry",
                table: "Users",
                newName: "EmailVerificationTokenExpiry");

            migrationBuilder.RenameColumn(
                name: "VerificationCode",
                table: "Users",
                newName: "EmailVerificationToken");
        }
    }
}
