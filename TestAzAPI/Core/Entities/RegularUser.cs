using TestAzAPI.Core.Enums;
using TestAzAPI.Core.Entities.Base;

namespace TestAzAPI.Core.Entities;

public class RegularUser : BaseUser
{
    public override UserRole Role => UserRole.User;
    
    public int CompletedQuizzes { get; set; }
    public double AverageScore { get; set; }
    public DateTime? LastQuizAttempt { get; set; }
} 