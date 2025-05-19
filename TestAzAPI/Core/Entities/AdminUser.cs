using TestAzAPI.Core.Enums;
using TestAzAPI.Core.Entities.Base;

namespace TestAzAPI.Core.Entities;

public class AdminUser : BaseUser
{
    public override UserRole Role => UserRole.Admin;
    
    public bool CanManageUsers { get; set; } = true;
    public bool CanManageQuizzes { get; set; } = true;
    public bool CanViewAnalytics { get; set; } = true;
    
    public int TotalQuizzesCreated { get; set; }
    public int TotalUsersManaged { get; set; }
    public DateTime? LastAdminAction { get; set; }
} 