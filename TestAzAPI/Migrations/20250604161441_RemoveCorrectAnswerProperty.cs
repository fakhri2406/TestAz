using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TestAzAPI.Migrations
{
    /// <inheritdoc />
    public partial class RemoveCorrectAnswerProperty : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                   IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Questions' AND column_name = 'CorrectAnswer') THEN
                      ALTER TABLE ""Questions"" DROP COLUMN ""CorrectAnswer"";
                   END IF;
                END $$;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CorrectAnswer",
                table: "Questions",
                type: "text",
                nullable: true);
        }
    }
}
