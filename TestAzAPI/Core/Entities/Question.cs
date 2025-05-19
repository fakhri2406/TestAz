using System.ComponentModel.DataAnnotations;
using TestAzAPI.Core.Enums;

namespace TestAzAPI.Core.Entities;

public class Question
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [StringLength(1000)]
    public string Text { get; set; } = string.Empty;
    
    public QuestionType Type { get; set; }
    public int Points { get; set; }
    public int Order { get; set; }
    
    public Guid QuizId { get; set; }
    public Quiz Quiz { get; set; } = null!;
    public ICollection<QuestionOption> Options { get; set; } = new List<QuestionOption>();
    public ICollection<QuestionAnswer> Answers { get; set; } = new List<QuestionAnswer>();
} 