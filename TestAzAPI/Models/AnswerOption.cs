using System.ComponentModel.DataAnnotations;

namespace TestAzAPI.Models;

public class AnswerOption
{
    public Guid Id { get; set; }
    
    public Guid QuestionId { get; set; }
    
    [Required]
    public required Question Question { get; set; }
    
    [Required]
    public required string Text { get; set; }
    
    public bool IsCorrect { get; set; }
    
    public int OrderIndex { get; set; }
}