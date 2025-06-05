using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TestAzAPI.Migrations
{
    /// <inheritdoc />
    public partial class ConvertCorrectAnswerToIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add the CorrectOptionIndex column (nullable for now)
            migrationBuilder.AddColumn<int>(
                name: "CorrectOptionIndex",
                table: "Questions",
                type: "integer",
                nullable: true);

            // Set CorrectOptionIndex based on CorrectAnswer text
            migrationBuilder.Sql(@"
                UPDATE ""Questions"" q
                SET ""CorrectOptionIndex"" = ao.""OrderIndex""
                FROM ""AnswerOptions"" ao
                WHERE ao.""QuestionId"" = q.""Id""
                AND ao.""Text"" = q.""CorrectAnswer"";
            ");

            // Optionally, drop the CorrectAnswer column
            migrationBuilder.DropColumn(
                name: "CorrectAnswer",
                table: "Questions");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Add back the CorrectAnswer column
            migrationBuilder.AddColumn<string>(
                name: "CorrectAnswer",
                table: "Questions",
                type: "text",
                nullable: true);

            // Set CorrectAnswer based on CorrectOptionIndex
            migrationBuilder.Sql(@"
                UPDATE ""Questions"" q
                SET ""CorrectAnswer"" = ao.""Text""
                FROM ""AnswerOptions"" ao
                WHERE ao.""QuestionId"" = q.""Id""
                AND ao.""OrderIndex"" = q.""CorrectOptionIndex"";
            ");

            // Drop the CorrectOptionIndex column
            migrationBuilder.DropColumn(
                name: "CorrectOptionIndex",
                table: "Questions");
        }
    }
}
