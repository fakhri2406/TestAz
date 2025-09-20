using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TestAzAPI.Models;
using TestAzAPI.Models.Enums;
using TestAzAPI.Repositories.Base;
using System.ComponentModel.DataAnnotations;

namespace TestAzAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    private readonly ITestRepository _testRepo;
    private readonly IOpenQuestionRepository _openQuestionRepo;

    public TestController(ITestRepository testRepo, IOpenQuestionRepository openQuestionRepo)
    {
        _testRepo = testRepo;
        _openQuestionRepo = openQuestionRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var tests = await _testRepo.GetAllAsync();
        return Ok(tests);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var test = await _testRepo.GetTestWithQuestionsAsync(id);
        if (test == null) return NotFound();

        var openQuestions = await _openQuestionRepo.GetByTestIdAsync(id);
        
        var result = new
        {
            Test = test,
            OpenQuestions = openQuestions
        };

        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("create")]
    public async Task<ActionResult<Test>> CreateTest([FromBody] CreateTestRequest request)
    {
        try
        {
            var test = new Test
            {
                Title = request.Title,
                Description = request.Description,
                IsPremium = request.IsPremium,
                Questions = new List<Question>()
            };

            foreach (var q in request.Questions)
            {
                var question = new Question
                {
                    Text = q.Text,
                    Test = test,
                    Options = new List<AnswerOption>(),
                    Type = QuestionType.MultipleChoice
                };

                // Add options with proper OrderIndex
                for (int i = 0; i < q.Options.Count; i++)
                {
                    question.Options.Add(new AnswerOption
                    {
                        Text = q.Options[i].Text,
                        IsCorrect = q.Options[i].IsCorrect,
                        Question = question,
                        OrderIndex = i // Set proper order index
                    });
                }

                test.Questions.Add(question);
            }

            await _testRepo.AddAsync(test);
            await _testRepo.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = test.Id }, test);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("{testId}/open-questions")]
    public async Task<ActionResult<OpenQuestion>> AddOpenQuestion(Guid testId, [FromBody] CreateOpenQuestionRequest request)
    {
        try
        {
            var test = await _testRepo.GetByIdAsync(testId);
            if (test == null)
                return NotFound("Test not found");

            var openQuestion = new OpenQuestion
            {
                TestId = testId,
                Text = request.Text,
                CorrectAnswer = request.CorrectAnswer,
                Points = request.Points
            };

            await _openQuestionRepo.AddAsync(openQuestion);
            await _openQuestionRepo.SaveAsync();

            return CreatedAtAction(nameof(GetOpenQuestion), new { testId, id = openQuestion.Id }, openQuestion);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{testId}/open-questions")]
    public async Task<IActionResult> GetOpenQuestions(Guid testId)
    {
        var openQuestions = await _openQuestionRepo.GetByTestIdAsync(testId);
        return Ok(openQuestions);
    }

    [HttpGet("{testId}/open-questions/{id}")]
    public async Task<IActionResult> GetOpenQuestion(Guid testId, Guid id)
    {
        var openQuestion = await _openQuestionRepo.GetWithTestAsync(id);
        if (openQuestion == null || openQuestion.TestId != testId) 
            return NotFound();

        return Ok(openQuestion);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{testId}/open-questions/{id}")]
    public async Task<IActionResult> UpdateOpenQuestion(Guid testId, Guid id, [FromBody] UpdateOpenQuestionRequest request)
    {
        var openQuestion = await _openQuestionRepo.GetByIdAsync(id);
        if (openQuestion == null || openQuestion.TestId != testId) 
            return NotFound();

        openQuestion.Text = request.Text;
        openQuestion.CorrectAnswer = request.CorrectAnswer;
        openQuestion.Points = request.Points;
        openQuestion.UpdatedAt = DateTime.UtcNow;

        _openQuestionRepo.Update(openQuestion);
        await _openQuestionRepo.SaveAsync();

        return Ok(openQuestion);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{testId}/open-questions/{id}")]
    public async Task<IActionResult> DeleteOpenQuestion(Guid testId, Guid id)
    {
        var openQuestion = await _openQuestionRepo.GetByIdAsync(id);
        if (openQuestion == null || openQuestion.TestId != testId) 
            return NotFound();

        _openQuestionRepo.Delete(openQuestion);
        await _openQuestionRepo.SaveAsync();

        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTestRequest request)
    {
        try
        {
            var existingTest = await _testRepo.GetTestWithQuestionsAsync(id);
            if (existingTest == null) return NotFound();

            // Update main properties
            existingTest.Title = request.Title;
            existingTest.Description = request.Description;
            existingTest.IsPremium = request.IsPremium;

            // Rebuild closed questions fully
            existingTest.Questions.Clear();

            if (request.Questions != null)
            {
                foreach (var q in request.Questions)
                {
                    var question = new Question
                    {
                        Text = q.Text,
                        Test = existingTest,
                        Options = new List<AnswerOption>(),
                        Type = QuestionType.MultipleChoice,
                        Points = q.Points ?? 1
                    };

                    for (int i = 0; i < (q.Options?.Count ?? 0); i++)
                    {
                        var opt = q.Options![i];
                        question.Options.Add(new AnswerOption
                        {
                            Text = opt.Text,
                            IsCorrect = opt.IsCorrect,
                            Question = question,
                            OrderIndex = i
                        });
                    }

                    existingTest.Questions.Add(question);
                }
            }

            _testRepo.Update(existingTest);
            await _testRepo.SaveChangesAsync();

            return Ok(existingTest);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message, details = ex.InnerException?.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var test = await _testRepo.GetByIdAsync(id);
        if (test == null) return NotFound();
        _testRepo.Delete(test);
        await _testRepo.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("fix-order-indices")]
    public async Task<IActionResult> FixOrderIndices()
    {
        try
        {
            var tests = await _testRepo.GetAllAsync();
            foreach (var test in tests)
            {
                foreach (var question in test.Questions)
                {
                    var orderedOptions = question.Options.OrderBy(o => o.Id).ToList();
                    for (int i = 0; i < orderedOptions.Count; i++)
                    {
                        orderedOptions[i].OrderIndex = i;
                    }
                }
            }
            await _testRepo.SaveChangesAsync();
            return Ok(new { message = "Order indices fixed successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public class CreateTestRequest
{
    [Required]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    public string Description { get; set; } = string.Empty;
    
    public bool IsPremium { get; set; }
    
    public List<CreateQuestionRequest> Questions { get; set; } = new List<CreateQuestionRequest>();
}

public class CreateQuestionRequest
{
    [Required]
    public string Text { get; set; } = string.Empty;
    
    public List<CreateOptionRequest> Options { get; set; } = new List<CreateOptionRequest>();
}

public class CreateOptionRequest
{
    [Required]
    public string Text { get; set; } = string.Empty;
    
    public bool IsCorrect { get; set; }
}

public class CreateOpenQuestionRequest
{
    [Required]
    public string Text { get; set; } = string.Empty;
    
    [Required]
    public string CorrectAnswer { get; set; } = string.Empty;
    
    public int Points { get; set; } = 1;
}

public class UpdateTestRequest
{
    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    public bool IsPremium { get; set; }

    public List<UpdateQuestionRequest> Questions { get; set; } = new List<UpdateQuestionRequest>();
}

public class UpdateQuestionRequest
{
    [Required]
    public string Text { get; set; } = string.Empty;

    public int? Points { get; set; }

    public List<UpdateOptionRequest> Options { get; set; } = new List<UpdateOptionRequest>();
}

public class UpdateOptionRequest
{
    [Required]
    public string Text { get; set; } = string.Empty;

    public bool IsCorrect { get; set; }
}

public class UpdateOpenQuestionRequest
{
    [Required]
    public string Text { get; set; } = string.Empty;
    
    [Required]
    public string CorrectAnswer { get; set; } = string.Empty;
    
    public int Points { get; set; } = 1;
}