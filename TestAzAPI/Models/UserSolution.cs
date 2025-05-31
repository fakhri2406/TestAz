using System.ComponentModel.DataAnnotations;

namespace TestAzAPI.Models;

public class UserSolution
{
    public Guid Id { get; set; }
    
    public Guid UserId { get; set; }
    
    [Required]
    public required User User { get; set; }
    
    public Guid TestId { get; set; }
    
    [Required]
    public required Test Test { get; set; }
    
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? CompletedAt { get; set; }
    
    public int? Score { get; set; }
    
    public DateTime? SubmittedAt { get; set; }
    
    public ICollection<UserAnswer> Answers { get; set; } = new List<UserAnswer>();
}