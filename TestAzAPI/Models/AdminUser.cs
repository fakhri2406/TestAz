using TestAzAPI.Enums;

namespace TestAzAPI.Models;

public class AdminUser : BaseUser
{
    public override UserRole Role => UserRole.Admin;
    
    public bool CanManageUsers { get; set; } = true;
    public bool CanManageQuizzes { get; set; } = true;
    public bool CanViewAnalytics { get; set; } = true;
} 