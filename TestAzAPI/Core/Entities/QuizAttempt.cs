using System.ComponentModel.DataAnnotations;
using TestAzAPI.Core.Entities.Base;

namespace TestAzAPI.Core.Entities;

public class QuizAttempt
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    
    public int TotalPoints { get; set; }
    public int MaxPoints { get; set; }
    public double Score { get; set; }
    
    public Guid QuizId { get; set; }
    public Quiz Quiz { get; set; } = null!;
    public Guid UserId { get; set; }
    public BaseUser User { get; set; } = null!;
    public ICollection<QuestionAnswer> Answers { get; set; } = new List<QuestionAnswer>();
} 