using System.ComponentModel.DataAnnotations;

namespace TestAzAPI.Models;

public class QuestionAnswer
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [StringLength(1000)]
    public string? AnswerText { get; set; }
    
    public Guid? SelectedOptionId { get; set; }
    public QuestionOption? SelectedOption { get; set; }
    
    public int PointsEarned { get; set; }
    public string? Feedback { get; set; }
    
    // Navigation properties
    public Guid QuestionId { get; set; }
    public Question Question { get; set; } = null!;
    public Guid QuizAttemptId { get; set; }
    public QuizAttempt QuizAttempt { get; set; } = null!;
} 