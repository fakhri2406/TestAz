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
            Answers = new List<UserAnswer>()
        };

        foreach (var answer in request.Answers)
        {
            var question = test.Questions.FirstOrDefault(q => q.Id == answer.QuestionId);
            if (question == null)
                continue;

            var userAnswer = new UserAnswer
            {
                UserSolution = solution,
                Question = question,
                AnswerText = answer.SelectedOptionIndex.ToString(),
                IsCorrect = answer.SelectedOptionIndex == question.CorrectOptionIndex,
                PointsEarned = answer.SelectedOptionIndex == question.CorrectOptionIndex ? question.Points : 0
            };

            solution.Answers.Add(userAnswer);
        }

        solution.Score = (int)solution.Answers.Sum(a => a.PointsEarned ?? 0);
        solution.CompletedAt = DateTime.UtcNow;

        await _solutionRepo.AddAsync(solution);
        await _solutionRepo.SaveChangesAsync();

        return Ok(new { 
            id = solution.Id,
            message = "Solution submitted successfully",
            score = solution.Score,
            totalQuestions = test.Questions.Count,
            correctAnswers = solution.Answers.Count(a => a.IsCorrect)
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
            Answers = solution.Answers.Select(a => new
            {
                QuestionId = a.QuestionId,
                QuestionText = a.Question.Text,
                SelectedOptionIndex = int.Parse(a.AnswerText),
                CorrectOptionIndex = a.Question.CorrectOptionIndex,
                Options = a.Question.Options.OrderBy(o => o.OrderIndex).Select(o => o.Text).ToList(),
                IsCorrect = a.IsCorrect,
                CorrectOption = a.Question.Options.FirstOrDefault(o => o.OrderIndex == a.Question.CorrectOptionIndex)?.Text
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
    
    [Required]
    public required List<UserAnswerRequest> Answers { get; set; }
}

public class UserAnswerRequest
{
    [Required]
    public required Guid QuestionId { get; set; }
    
    public int SelectedOptionIndex { get; set; }
}
