using System.ComponentModel.DataAnnotations;
using TestAzAPI.Core.Entities.Base;

namespace TestAzAPI.Core.Entities;

public class Quiz
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [StringLength(1000)]
    public string Description { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    public bool IsPublished { get; set; }
    public int TimeLimitMinutes { get; set; }
    
    public Guid CreatedById { get; set; }
    public BaseUser CreatedBy { get; set; } = null!;
    public ICollection<Question> Questions { get; set; } = new List<Question>();
    public ICollection<QuizAttempt> QuizAttempts { get; set; } = new List<QuizAttempt>();
} 