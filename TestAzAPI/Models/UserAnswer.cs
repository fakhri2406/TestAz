namespace TestAzAPI.Models;
public class UserAnswer
{
    public Guid Id { get; set; }

    public Guid UserSolutionId { get; set; }
    public UserSolution UserSolution { get; set; }

    public Guid QuestionId { get; set; }
    public Question Question { get; set; }

    public string AnswerText { get; set; }
}
