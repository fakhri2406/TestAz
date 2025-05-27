using Microsoft.AspNetCore.Mvc;
using TestAzAPI.Models;
using TestAzAPI.Repositories.Base;

namespace TestAzAPI.Controllers;


[ApiController]
[Route("api/[controller]")]
public class UserSolutionController : ControllerBase
{
    private readonly IUserSolutionRepository _solutionRepo;
    private readonly ITestRepository _testRepo;

    public UserSolutionController(IUserSolutionRepository solutionRepo, ITestRepository testRepo)
    {
        _solutionRepo = solutionRepo;
        _testRepo = testRepo;
    }

    [HttpPost]
    public async Task<IActionResult> Submit(UserSolutionRequest request)
    {
        try
        {
            // Get the test to verify answers
            var test = await _testRepo.GetTestWithQuestionsAsync(request.TestId);
            if (test == null)
            {
                return NotFound("Test not found");
            }

            // Create user solution
            var solution = new UserSolution
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                TestId = request.TestId,
                SubmittedAt = DateTime.UtcNow,
                Answers = new List<UserAnswer>()
            };

            // Process each answer
            int correctAnswers = 0;
            foreach (var answer in request.Answers)
            {
                var question = test.Questions.FirstOrDefault(q => q.Id == answer.QuestionId);
                if (question == null) continue;

                var userAnswer = new UserAnswer
                {
                    Id = Guid.NewGuid(),
                    UserSolutionId = solution.Id,
                    QuestionId = answer.QuestionId,
                    AnswerText = answer.SelectedOptionIndex.ToString()
                };

                solution.Answers.Add(userAnswer);

                // Check if answer is correct
                if (question.CorrectOptionIndex == answer.SelectedOptionIndex)
                {
                    correctAnswers++;
                }
            }

            // Calculate score
            solution.Score = test.Questions.Count > 0 
                ? (double)correctAnswers / test.Questions.Count * 100 
                : 0;

            await _solutionRepo.AddAsync(solution);
            await _solutionRepo.SaveChangesAsync();

            return Ok(new { 
                message = "Solution submitted successfully",
                score = solution.Score,
                totalQuestions = test.Questions.Count,
                correctAnswers = correctAnswers
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetByUser(Guid userId)
    {
        var solutions = await _solutionRepo.GetUserSolutionsWithAnswersAsync(userId);
        return Ok(solutions);
    }
}

public class UserSolutionRequest
{
    public Guid TestId { get; set; }
    public Guid UserId { get; set; }
    public List<UserAnswerRequest> Answers { get; set; }
}

public class UserAnswerRequest
{
    public Guid QuestionId { get; set; }
    public int SelectedOptionIndex { get; set; }
}
