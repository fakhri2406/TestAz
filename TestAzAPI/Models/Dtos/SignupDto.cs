using System.ComponentModel.DataAnnotations;

namespace TestAzAPI.Models.Dtos;

public class SignupDto
{
    [Required]
    [EmailAddress]
    public required string Email { get; set; }
    
    [Required]
    [MinLength(6)]
    public required string Password { get; set; }
    
    [Required]
    [MinLength(2)]
    public required string Name { get; set; }
    
    [Required]
    [MinLength(2)]
    public required string Surname { get; set; }
}
