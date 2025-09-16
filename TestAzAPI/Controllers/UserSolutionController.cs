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
    private readonly IOpenQuestionRepository _openQuestionRepo;
    private readonly ILogger<UserSolutionController> _logger;

    public UserSolutionController(IUserSolutionRepository solutionRepo, ITestRepository testRepo, IUserRepository userRepo, IOpenQuestionRepository openQuestionRepo, ILogger<UserSolutionController> logger)
    {
        _solutionRepo = solutionRepo;
        _testRepo = testRepo;
        _userRepo = userRepo;
        _openQuestionRepo = openQuestionRepo;
        _logger = logger;
    }

    [HttpPost("submit")]
    public async Task<IActionResult> SubmitSolution([FromBody] SubmitSolutionRequest request)
    {
        _logger.LogInformation("SubmitSolution received: TestId={TestId}, UserId={UserId}, Answers={AnswerCount}", request.TestId, request.UserId, request.Answers?.Count ?? 0);

        var user = await _userRepo.GetByIdAsync(request.UserId);
        if (user == null)
            return NotFound(new { message = "User not found" });

        var test = await _testRepo.GetByIdAsync(request.TestId);
        if (test == null)
            return NotFound(new { message = "Test not found" });

        if (request.Answers == null || request.Answers.Count == 0)
            return BadRequest(new { message = "Answers are required" });

        // Fetch open questions for this test to detect mixed submissions
        var openQuestions = (await _openQuestionRepo.GetByTestIdAsync(request.TestId)).ToList();
        var hasOpenAnswers = false;

        var solution = new UserSolution
        {
            User = user,
            Test = test,
            StartedAt = DateTime.UtcNow,
            SubmittedAt = DateTime.UtcNow,
            Score = 0,
            Answers = new List<UserAnswer>()
        };

        var closedQuestionsById = test.Questions.ToDictionary(q => q.Id, q => q);
        var closedCorrectCount = 0;
        foreach (var answer in request.Answers)
        {
            if (closedQuestionsById.TryGetValue(answer.QuestionId, out var question))
            {
                var orderedOptions = question.Options.OrderBy(o => o.OrderIndex).ToList();
                var serverCorrectIndex = orderedOptions.FindIndex(o => o.IsCorrect);

                // Validate selected index for closed questions
                if (answer.selectedOptionIndex < 0 || answer.selectedOptionIndex >= orderedOptions.Count)
                {
                    _logger.LogWarning("Invalid selectedOptionIndex: TestId={TestId}, QuestionId={QuestionId}, SelectedIndex={SelectedIndex}, OptionsCount={OptionsCount}", request.TestId, question.Id, answer.selectedOptionIndex, orderedOptions.Count);
                    return BadRequest(new { message = $"Invalid selectedOptionIndex for question {question.Id}" });
                }

                var isCorrect = answer.selectedOptionIndex == serverCorrectIndex;
                closedCorrectCount += isCorrect ? 1 : 0;

                var userAnswer = new UserAnswer
                {
                    UserSolution = solution,
                    Question = question,
                    AnswerText = $"{answer.selectedOptionIndex},{serverCorrectIndex}",
                    IsCorrect = isCorrect,
                    PointsEarned = isCorrect ? question.Points : 0
                };

                solution.Answers.Add(userAnswer);
            }
            else if (openQuestions.Any(oq => oq.Id == answer.QuestionId))
            {
                // Mixed-type submission detected; accept open answers but do not auto-grade or persist (requires manual grading flow)
                hasOpenAnswers = true;
                continue;
            }
            else
            {
                _logger.LogWarning("Answer references unknown QuestionId in test: TestId={TestId}, QuestionId={QuestionId}", request.TestId, answer.QuestionId);
                continue;
            }
        }

        // Compute final score based on closed questions only
        var closedCount = test.Questions.Count;
        var scorePercent = closedCount > 0 ? (int)Math.Round((double)closedCorrectCount / closedCount * 100) : 0;
        solution.Score = scorePercent;
        solution.CompletedAt = DateTime.UtcNow;

        await _solutionRepo.AddAsync(solution);
        await _solutionRepo.SaveChangesAsync();

        var responseBody = new
        {
            id = solution.Id,
            message = hasOpenAnswers ? "Solution accepted for review. Open answers require manual grading." : "Solution submitted successfully",
            scorePercent = scorePercent,
            scoreString = $"{closedCorrectCount}/{closedCount}",
            totalQuestions = closedCount + openQuestions.Count,
            correctAnswers = closedCorrectCount,
            totalPossiblePoints = test.Questions.Sum(q => q.Points),
            earnedPoints = solution.Answers.Sum(a => a.PointsEarned ?? 0),
            answers = solution.Answers.Select(a => {
                var question = test.Questions.First(q => q.Id == a.QuestionId);
                var orderedOptions = question.Options.OrderBy(o => o.OrderIndex).ToList();
                var indices = a.AnswerText.Split(',');
                var selectedOptionIndex = int.TryParse(indices.ElementAtOrDefault(0), out var sel) ? sel : -1;
                var correctOptionIndex = int.TryParse(indices.ElementAtOrDefault(1), out var cor) ? cor : -1;

                return new
                {
                    questionId = a.QuestionId,
                    selectedOptionIndex = selectedOptionIndex,
                    correctOptionIndex = correctOptionIndex,
                    isCorrect = a.IsCorrect,
                    options = orderedOptions.Select(o => o.Text).ToList()
                };
            }).ToList()
        };

        if (hasOpenAnswers)
        {
            _logger.LogInformation("SubmitSolution accepted with open answers requiring manual grading: SolutionId={SolutionId}, TestId={TestId}, UserId={UserId}", solution.Id, request.TestId, request.UserId);
            return StatusCode(202, responseBody);
        }
        _logger.LogInformation("SubmitSolution completed: SolutionId={SolutionId}, TestId={TestId}, UserId={UserId}", solution.Id, request.TestId, request.UserId);
        return Ok(responseBody);
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

        // Get all questions for this test directly from the database
        var questions = await _testRepo.GetTestQuestionsAsync(solution.TestId);
        if (questions == null || !questions.Any())
        {
            return NotFound("No questions found for this test");
        }

        var questionsList = questions.ToList(); // Execute the query here

        // Transform the response
        var transformedSolution = new
        {
            solution.Id,
            solution.TestId,
            TestTitle = solution.Test.Title,
            solution.UserId,
            UserName = $"{solution.User.Name} {solution.User.Surname}",
            solution.Score,
            TotalQuestions = questionsList.Count,
            solution.SubmittedAt,
            Questions = questionsList.Select(q => {
                var orderedOptions = q.Options.OrderBy(o => o.OrderIndex).ToList();
                var correctOptionIndex = orderedOptions.FindIndex(o => o.IsCorrect);
                return new
                {
                    QuestionId = q.Id,
                    QuestionText = q.Text,
                    Options = orderedOptions.Select(o => o.Text).ToList(),
                    CorrectOptionIndex = correctOptionIndex
                };
            }).ToList(),
            Answers = solution.Answers.Select(a => {
                var indices = a.AnswerText.Split(',');
                var selectedOptionIndex = int.TryParse(indices[0], out var selected) ? selected : -1;
                var correctOptionIndex = int.TryParse(indices[1], out var correct) ? correct : -1;
                var question = questionsList.FirstOrDefault(q => q.Id == a.QuestionId);
                var orderedOptions = question?.Options.OrderBy(o => o.OrderIndex).ToList() ?? new List<AnswerOption>();
                
                return new
                {
                    QuestionId = a.QuestionId,
                    QuestionText = a.Question.Text,
                    SelectedOptionIndex = selectedOptionIndex,
                    CorrectOptionIndex = correctOptionIndex,
                    SelectedOption = selectedOptionIndex >= 0 ? orderedOptions.ElementAtOrDefault(selectedOptionIndex)?.Text : null,
                    CorrectOption = correctOptionIndex >= 0 ? orderedOptions.ElementAtOrDefault(correctOptionIndex)?.Text : null,
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
    
    public int selectedOptionIndex { get; set; }
    
    public int correctOptionIndex { get; set; }

    public string? AnswerText { get; set; }
}
