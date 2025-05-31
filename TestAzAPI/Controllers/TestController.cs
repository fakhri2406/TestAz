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

    public TestController(ITestRepository testRepo)
    {
        _testRepo = testRepo;
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
        return test == null ? NotFound() : Ok(test);
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
                    Type = QuestionType.MultipleChoice,
                    CorrectOptionIndex = q.CorrectOptionIndex
                };

                for (int i = 0; i < q.Options.Count; i++)
                {
                    question.Options.Add(new AnswerOption
                    {
                        Text = q.Options[i],
                        IsCorrect = i == q.CorrectOptionIndex,
                        Question = question
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
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, Test test)
    {
        if (id != test.Id) return BadRequest();
        _testRepo.Update(test);
        await _testRepo.SaveChangesAsync();
        return NoContent();
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
}

public class CreateTestRequest
{
    [Required]
    public required string Title { get; set; }
    
    [Required]
    public required string Description { get; set; }
    
    public bool IsPremium { get; set; }
    
    [Required]
    public required List<CreateQuestionRequest> Questions { get; set; }
}

public class CreateQuestionRequest
{
    [Required]
    public required string Text { get; set; }
    
    [Required]
    public required List<string> Options { get; set; }
    
    public int CorrectOptionIndex { get; set; }
}
