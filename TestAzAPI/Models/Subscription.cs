using System.ComponentModel.DataAnnotations;

namespace TestAzAPI.Models;

public class Subscription
{
    public Guid Id { get; set; }
    
    public Guid UserId { get; set; }
    
    [Required]
    public required User User { get; set; }
    
    [Required]
    public required decimal Amount { get; set; }
    
    [Required]
    public required string Currency { get; set; } = "USD";
    
    [Required]
    public required DateTime StartDate { get; set; } = DateTime.UtcNow;
    
    [Required]
    public required DateTime EndDate { get; set; }
    
    [Required]
    public required string PaymentId { get; set; }
    
    [Required]
    public required string PaymentStatus { get; set; }
    
    public string? PaymentError { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
} 