using Microsoft.AspNetCore.Mvc;
using TestAzAPI.Models;
using TestAzAPI.Repositories.Base;
using System.ComponentModel.DataAnnotations;

namespace TestAzAPI.Controllers;


[ApiController]
[Route("api/[controller]")]
public class UserSolutionController : ControllerBase
{
    private readonly IUserSolutionRepository _solutionRepo;
    private readonly ITestRepository _testRepo;
    private readonly IUserRepository _userRepo;

    public UserSolutionController(IUserSolutionRepository solutionRepo, ITestRepository testRepo, IUserRepository userRepo)
    {
        _solutionRepo = solutionRepo;
        _testRepo = testRepo;
        _userRepo = userRepo;
    }

    [HttpPost("submit")]
    public async Task<IActionResult> SubmitSolution([FromBody] SubmitSolutionRequest request)
    {
        Console.WriteLine($"Received solution submission for TestId: {request.TestId}, UserId: {request.UserId}");
        Console.WriteLine($"Score: {request.Score}, Correct Answers: {request.CorrectAnswers}/{request.TotalQuestions}");

        var user = await _userRepo.GetByIdAsync(request.UserId);
        if (user == null)
            return NotFound("User not found");

        var test = await _testRepo.GetByIdAsync(request.TestId);
        if (test == null)
            return NotFound("Test not found");

        var solution = new UserSolution
        {
            User = user,
            Test = test,
            StartedAt = DateTime.UtcNow,
            SubmittedAt = DateTime.UtcNow,
            Score = request.Score,
            Answers = new List<UserAnswer>()
        };

        foreach (var answer in request.Answers)
        {
            var question = test.Questions.FirstOrDefault(q => q.Id == answer.QuestionId);
            if (question == null)
            {
                Console.WriteLine($"Question {answer.QuestionId} not found in test");
                continue;
            }

            var userAnswer = new UserAnswer
            {
                UserSolution = solution,
                Question = question,
                AnswerText = "0", // We don't need to store the selected index anymore
                IsCorrect = answer.IsCorrect,
                PointsEarned = answer.IsCorrect ? question.Points : 0
            };

            solution.Answers.Add(userAnswer);
        }

        solution.CompletedAt = DateTime.UtcNow;

        await _solutionRepo.AddAsync(solution);
        await _solutionRepo.SaveChangesAsync();

        return Ok(new { 
            id = solution.Id,
            message = "Solution submitted successfully",
            score = request.ScoreString,
            totalQuestions = request.TotalQuestions,
            correctAnswers = request.CorrectAnswers,
            totalPossiblePoints = test.Questions.Sum(q => q.Points),
            earnedPoints = solution.Answers.Sum(a => a.PointsEarned ?? 0)
        });
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetByUser(Guid userId)
    {
        var solutions = await _solutionRepo.GetUserSolutionsWithAnswersAsync(userId);
        return Ok(solutions);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var solution = await _solutionRepo.GetUserSolutionWithDetailsAsync(id);
        if (solution == null)
        {
            return NotFound("Solution not found");
        }

        // Transform the response to include string options
        var transformedSolution = new
        {
            solution.Id,
            solution.TestId,
            TestTitle = solution.Test.Title,
            solution.UserId,
            UserName = $"{solution.User.Name} {solution.User.Surname}",
            solution.Score,
            TotalQuestions = solution.Test.Questions.Count,
            solution.SubmittedAt,
            Answers = solution.Answers.Select(a => {
                // Parse the selected option index from AnswerText
                var selectedOptionIndex = int.TryParse(a.AnswerText, out var index) ? index : -1;
                var orderedOptions = a.Question.Options.OrderBy(o => o.OrderIndex).ToList();
                
                return new
                {
                    QuestionId = a.QuestionId,
                    QuestionText = a.Question.Text,
                    SelectedOptionIndex = selectedOptionIndex,
                    SelectedOption = selectedOptionIndex >= 0 ? orderedOptions.ElementAtOrDefault(selectedOptionIndex)?.Text : null,
                    CorrectOption = a.Question.Options.FirstOrDefault(o => o.IsCorrect)?.Text,
                    Options = orderedOptions.Select(o => o.Text).ToList(),
                    IsCorrect = a.IsCorrect,
                    PointsEarned = a.PointsEarned,
                    TotalPoints = a.Question.Points
                };
            }).ToList()
        };

        return Ok(transformedSolution);
    }
}

public class SubmitSolutionRequest
{
    [Required]
    public required Guid TestId { get; set; }
    
    [Required]
    public required Guid UserId { get; set; }
    
    public int Score { get; set; }
    
    public string ScoreString { get; set; } = string.Empty;
    
    public int TotalQuestions { get; set; }
    
    public int CorrectAnswers { get; set; }
    
    [Required]
    public required List<UserAnswerRequest> Answers { get; set; }
}

public class UserAnswerRequest
{
    [Required]
    public required Guid QuestionId { get; set; }
    
    public bool IsCorrect { get; set; }
}
