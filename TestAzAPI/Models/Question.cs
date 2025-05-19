using TestAzAPI.Models.Enums;

namespace TestAzAPI.Models;

public class Question
{
    public Guid Id { get; set; }
    public Guid TestId { get; set; }
    public Test Test { get; set; }

    public string Text { get; set; }
    public QuestionType Type { get; set; }

    // Only used if multiple choice
    public ICollection<AnswerOption>? Options { get; set; }

    public string? CorrectAnswer { get; set; }
}


