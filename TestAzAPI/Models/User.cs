using System.ComponentModel.DataAnnotations;

namespace TestAzAPI.Models;

public class User
{
    public Guid Id { get; set; }
    
    [Required]
    public required string Name { get; set; }
    
    [Required]
    public required string Surname { get; set; }
    
    [Required]
    [EmailAddress]
    public required string Email { get; set; }
    
    [Required]
    public required byte[] PasswordHash { get; set; }
    
    [Required]
    public required byte[] PasswordSalt { get; set; }
    
    public bool IsPremium { get; set; }
    
    public string Role { get; set; } = "User";
    
    public ICollection<UserSolution> Solutions { get; set; } = new List<UserSolution>();
}