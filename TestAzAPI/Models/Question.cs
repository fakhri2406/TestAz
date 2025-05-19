using TestAzAPI.Models.Enums;

namespace TestAzAPI.Models;

public class Question
{
    public Guid Id { get; set; }
    public Guid TestId { get; set; }
    public Test Test { get; set; }

    public string Text { get; set; }
    public QuestionType Type { get; set; }

    public ICollection<AnswerOption>? Options { get; set; }
    public string? CorrectAnswer { get; set; }

    public ICollection<UserAnswer>? UserAnswers { get; set; } // Add this
}
