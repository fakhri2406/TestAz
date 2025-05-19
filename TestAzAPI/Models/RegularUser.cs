using TestAzAPI.Enums;

namespace TestAzAPI.Models;

public class RegularUser : BaseUser
{
    public override UserRole Role => UserRole.User;
    
    // Additional user-specific properties
    public int CompletedQuizzes { get; set; }
    public double AverageScore { get; set; }
    public DateTime? LastQuizAttempt { get; set; }
} 