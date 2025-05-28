namespace TestAzAPI.Models;

public class User
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Surname { get; set; }
    public string Email { get; set; }
    public byte[] PasswordHash { get; set; }
    public byte[] PasswordSalt { get; set; }
    public string Role { get; set; } = "User"; // "Admin" or "User"
    public bool IsPremium { get; set; } = false;

    public ICollection<UserSolution> Solutions { get; set; }
}