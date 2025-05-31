using System.ComponentModel.DataAnnotations;

namespace TestAzAPI.Models.Dtos;

public class LoginDto
{
    [Required]
    [EmailAddress]
    public required string Email { get; set; }
    
    [Required]
    [MinLength(6)]
    public required string Password { get; set; }
}
