namespace TestAzAPI.Models;

public class Test
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public bool IsPremium { get; set; }

    public ICollection<Question> Questions { get; set; }
}
