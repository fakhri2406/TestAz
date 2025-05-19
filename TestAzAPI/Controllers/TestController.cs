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

    [HttpPost]
    public async Task<IActionResult> Create(Test test)
    {
        await _testRepo.AddAsync(test);
        await _testRepo.SaveChangesAsync();
        return Ok(test);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, Test test)
    {
        if (id != test.Id) return BadRequest();
        _testRepo.Update(test);
        await _testRepo.SaveChangesAsync();
        return NoContent();
    }

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
