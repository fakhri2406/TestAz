using System.ComponentModel.DataAnnotations;

namespace TestAzAPI.Models;

public class PremiumRequest
{
    public Guid Id { get; set; }
    
    [Required]
    public required Guid UserId { get; set; }
    
    public User User { get; set; } = null!;
    
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? ProcessedAt { get; set; }
    
    public string? ProcessedBy { get; set; }
    
    public string? RejectionReason { get; set; }
} 