using Microsoft.AspNetCore.Mvc;
using TestAzAPI.Models;
using TestAzAPI.Repositories.Base;

namespace TestAzAPI.Controllers;


[ApiController]
[Route("api/[controller]")]
public class UserSolutionController : ControllerBase
{
    private readonly IUserSolutionRepository _solutionRepo;

    public UserSolutionController(IUserSolutionRepository solutionRepo)
    {
        _solutionRepo = solutionRepo;
    }

    [HttpPost]
    public async Task<IActionResult> Submit(UserSolution solution)
    {
        await _solutionRepo.AddAsync(solution);
        await _solutionRepo.SaveChangesAsync();
        return Ok(new { message = "Solution submitted." });
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetByUser(Guid userId)
    {
        var solutions = await _solutionRepo.GetUserSolutionsWithAnswersAsync(userId);
        return Ok(solutions);
    }
}
