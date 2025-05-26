using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TestAzAPI.Models;
using TestAzAPI.Repositories.Base;

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
                Questions = request.Questions.Select(q => new Question
                {
                    Text = q.Text,
                    Options = q.Options.Select((opt, index) => new AnswerOption
                    {
                        Text = opt,
                        IsCorrect = index == q.CorrectOptionIndex
                    }).ToList(),
                    CorrectOptionIndex = q.CorrectOptionIndex
                }).ToList()
            };

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
    public string Title { get; set; }
    public string Description { get; set; }
    public List<CreateQuestionRequest> Questions { get; set; }
}

public class CreateQuestionRequest
{
    public string Text { get; set; }
    public List<string> Options { get; set; }
    public int CorrectOptionIndex { get; set; }
}
