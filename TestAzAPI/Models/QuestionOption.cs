using System.ComponentModel.DataAnnotations;

namespace TestAzAPI.Models;

public class QuestionOption
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [StringLength(500)]
    public string Text { get; set; } = string.Empty;
    
    public bool IsCorrect { get; set; }
    public int Order { get; set; }
    
    // Navigation properties
    public Guid QuestionId { get; set; }
    public Question Question { get; set; } = null!;
} 