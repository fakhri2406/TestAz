using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TestAzAPI.Migrations
{
    /// <inheritdoc />
    public partial class RemoveCorrectOptionIndexColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // First, update any existing questions to set IsCorrect on the corresponding AnswerOption
            migrationBuilder.Sql(@"
                UPDATE ""AnswerOptions"" ao
                SET ""IsCorrect"" = true
                FROM ""Questions"" q
                WHERE ao.""QuestionId"" = q.""Id""
                AND ao.""OrderIndex"" = q.""CorrectOptionIndex"";
            ");

            // Then drop the CorrectOptionIndex column
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

            // Update CorrectOptionIndex based on IsCorrect flag
            migrationBuilder.Sql(@"
                UPDATE ""Questions"" q
                SET ""CorrectOptionIndex"" = (
                    SELECT ao.""OrderIndex""
                    FROM ""AnswerOptions"" ao
                    WHERE ao.""QuestionId"" = q.""Id""
                    AND ao.""IsCorrect"" = true
                    LIMIT 1
                );
            ");
        }
    }
}
