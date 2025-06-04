using Microsoft.EntityFrameworkCore.Migrations;

namespace TestAzAPI.Data.Migrations;

public partial class FixAnswerOptionOrderIndex : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Create a temporary table to store the correct order indices
        migrationBuilder.Sql(@"
            WITH OrderedOptions AS (
                SELECT 
                    ao.Id,
                    ao.QuestionId,
                    ROW_NUMBER() OVER (PARTITION BY ao.QuestionId ORDER BY ao.Id) - 1 as NewOrderIndex
                FROM AnswerOptions ao
            )
            UPDATE AnswerOptions
            SET OrderIndex = oo.NewOrderIndex
            FROM AnswerOptions ao
            INNER JOIN OrderedOptions oo ON ao.Id = oo.Id;
        ");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // Revert all OrderIndex values to 0
        migrationBuilder.Sql("UPDATE AnswerOptions SET OrderIndex = 0;");
    }
} 