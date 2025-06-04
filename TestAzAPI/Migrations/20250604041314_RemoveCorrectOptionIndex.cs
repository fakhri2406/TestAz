using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TestAzAPI.Migrations
{
    /// <inheritdoc />
    public partial class RemoveCorrectOptionIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop the CorrectOptionIndex column from Questions table
            migrationBuilder.DropColumn(
                name: "CorrectOptionIndex",
                table: "Questions");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Add back the CorrectOptionIndex column
            migrationBuilder.AddColumn<int>(
                name: "CorrectOptionIndex",
                table: "Questions",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
