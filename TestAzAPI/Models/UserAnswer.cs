using System.ComponentModel.DataAnnotations;

namespace TestAzAPI.Models;

public class UserAnswer
{
    public Guid Id { get; set; }
    
    public Guid UserSolutionId { get; set; }
    
    [Required]
    public required UserSolution UserSolution { get; set; }
    
    public Guid QuestionId { get; set; }
    
    [Required]
    public required Question Question { get; set; }
    
    [Required]
    public required string AnswerText { get; set; }
    
    public bool IsCorrect { get; set; }
    
    public int? PointsEarned { get; set; }
}
