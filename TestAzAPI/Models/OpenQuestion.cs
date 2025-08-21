using System.ComponentModel.DataAnnotations;

namespace TestAzAPI.Models;

public class OpenQuestion
{
    public Guid Id { get; set; }
    
    public Guid TestId { get; set; }
    
    public Test Test { get; set; }
    
    [Required]
    public required string Text { get; set; }
    
    public int Points { get; set; } = 1;
    
    [Required]
    public required string CorrectAnswer { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
}