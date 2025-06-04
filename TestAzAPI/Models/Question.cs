using TestAzAPI.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace TestAzAPI.Models;

public class Question
{
    public Guid Id { get; set; }
    
    public Guid TestId { get; set; }
    
    [Required]
    public required Test Test { get; set; }
    
    [Required]
    public required string Text { get; set; }
    
    public int Points { get; set; } = 1;
    
    public ICollection<AnswerOption> Options { get; set; } = new List<AnswerOption>();
    
    public ICollection<UserAnswer> UserAnswers { get; set; } = new List<UserAnswer>();

    public QuestionType Type { get; set; }
    public string? CorrectAnswer { get; set; }
}
