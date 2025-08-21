using System.ComponentModel.DataAnnotations;

namespace TestAzAPI.Models;

public class Test
{
    public Guid Id { get; set; }
    
    [Required]
    public required string Title { get; set; }
    
    [Required]
    public required string Description { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public bool IsActive { get; set; } = true;
    
    public bool IsPremium { get; set; } = false;
    
    public ICollection<Question> Questions { get; set; } = new List<Question>();
    public ICollection<OpenQuestion> OpenQuestions { get; set; } = new List<OpenQuestion>();
    public ICollection<UserSolution> UserSolutions { get; set; } = new List<UserSolution>();
}
