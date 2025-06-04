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
        Console.WriteLine($"Number of answers submitted: {request.Answers.Count}");

        var user = await _userRepo.GetByIdAsync(request.UserId);
        if (user == null)
            return NotFound("User not found");

        var test = await _testRepo.GetByIdAsync(request.TestId);
        if (test == null)
            return NotFound("Test not found");

        Console.WriteLine($"Test found with {test.Questions.Count} questions");
        foreach (var question in test.Questions)
        {
            var correctOption = question.Options.FirstOrDefault(o => o.IsCorrect);
            Console.WriteLine($"Question {question.Id}: Correct option = {correctOption?.Text ?? "none"}");
        }

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
            Console.WriteLine($"\nProcessing answer for QuestionId: {answer.QuestionId}");
            Console.WriteLine($"SelectedOptionIndex from request: {answer.SelectedOptionIndex}");

            var question = test.Questions.FirstOrDefault(q => q.Id == answer.QuestionId);
            if (question == null)
            {
                Console.WriteLine($"Question {answer.QuestionId} not found in test");
                continue;
            }

            var orderedOptions = question.Options.OrderBy(o => o.OrderIndex).ToList();
            Console.WriteLine($"Question found: {question.Text}");
            Console.WriteLine("Options in order:");
            for (int i = 0; i < orderedOptions.Count; i++)
            {
                Console.WriteLine($"  {i}. {orderedOptions[i].Text} (OrderIndex: {orderedOptions[i].OrderIndex}, IsCorrect: {orderedOptions[i].IsCorrect})");
            }

            // Find the selected option
            var selectedOption = orderedOptions.ElementAtOrDefault(answer.SelectedOptionIndex - 1);
            var isCorrect = selectedOption?.IsCorrect ?? false;
            
            Console.WriteLine($"Selected option: {selectedOption?.Text ?? "none"}");
            Console.WriteLine($"Is answer correct? {isCorrect}");

            var userAnswer = new UserAnswer
            {
                UserSolution = solution,
                Question = question,
                AnswerText = answer.SelectedOptionIndex.ToString(),
                IsCorrect = isCorrect,
                PointsEarned = isCorrect ? question.Points : 0
            };

            solution.Answers.Add(userAnswer);
        }

        // Calculate total possible points
        var totalPossiblePoints = test.Questions.Sum(q => q.Points);
        // Calculate earned points
        var earnedPoints = solution.Answers.Sum(a => a.PointsEarned ?? 0);
        // Calculate correct answers count
        var correctAnswersCount = solution.Answers.Count(a => a.IsCorrect);
        var totalQuestions = test.Questions.Count;
        // Calculate score as correct/total string
        var scoreString = $"{correctAnswersCount}/{totalQuestions}";
        solution.Score = totalQuestions > 0 ? (int)((correctAnswersCount * 100.0) / totalQuestions) : 0;
        solution.CompletedAt = DateTime.UtcNow;

        await _solutionRepo.AddAsync(solution);
        await _solutionRepo.SaveChangesAsync();

        return Ok(new { 
            id = solution.Id,
            message = "Solution submitted successfully",
            score = scoreString,
            totalQuestions = totalQuestions,
            correctAnswers = correctAnswersCount,
            totalPossiblePoints = totalPossiblePoints,
            earnedPoints = earnedPoints,
            answers = solution.Answers.Select(a => new {
                questionId = a.QuestionId,
                questionText = a.Question.Text,
                selectedOptionIndex = int.Parse(a.AnswerText),
                selectedOption = a.Question.Options.OrderBy(o => o.OrderIndex).ElementAtOrDefault(int.Parse(a.AnswerText) - 1)?.Text,
                correctOption = a.Question.Options.FirstOrDefault(o => o.IsCorrect)?.Text,
                options = a.Question.Options.OrderBy(o => o.OrderIndex).Select(o => o.Text).ToList(),
                isCorrect = a.IsCorrect,
                pointsEarned = a.PointsEarned,
                totalPoints = a.Question.Points
            }).ToList()
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
                SelectedOption = a.Question.Options.OrderBy(o => o.OrderIndex).ElementAtOrDefault(int.Parse(a.AnswerText) - 1)?.Text,
                CorrectOption = a.Question.Options.FirstOrDefault(o => o.IsCorrect)?.Text,
                Options = a.Question.Options.OrderBy(o => o.OrderIndex).Select(o => o.Text).ToList(),
                IsCorrect = a.IsCorrect
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
