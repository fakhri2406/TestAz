namespace TestAzAPI.Models;

public class UserSolution
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; }
    public Guid TestId { get; set; }
    public Test Test { get; set; }
    public DateTime SubmittedAt { get; set; }
    public ICollection<UserAnswer> Answers { get; set; }
    public double Score { get; set; }
}