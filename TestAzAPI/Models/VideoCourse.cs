using System.ComponentModel.DataAnnotations;

namespace TestAzAPI.Models;

public class VideoCourse
{
    public Guid Id { get; set; }
    
    [Required]
    public required string Title { get; set; }
    
    [Required]
    [Url]
    public required string Url { get; set; }
    
    public string? Description { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public bool IsActive { get; set; } = true;
    
    public int? DurationInMinutes { get; set; }
    
    public string? ThumbnailUrl { get; set; }
}
