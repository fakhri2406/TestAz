using Microsoft.AspNetCore.Mvc;
using TestAzAPI.Models;
using TestAzAPI.Repositories.Base;

namespace TestAzAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VideocourseController : ControllerBase
{
    private readonly IVideoCourseRepository _vcRepo;

    public VideocourseController(IVideoCourseRepository vcRepo)
    {
        _vcRepo = vcRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _vcRepo.GetAllAsync());
    }

    [HttpPost]
    public async Task<IActionResult> Create(Videocourse course)
    {
        await _vcRepo.AddAsync(course);
        await _vcRepo.SaveChangesAsync();
        return Ok(course);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var vc = await _vcRepo.GetByIdAsync(id);
        if (vc == null) return NotFound();
        _vcRepo.Delete(vc);
        await _vcRepo.SaveChangesAsync();
        return NoContent();
    }
}
