using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TestAzAPI.Models;
using TestAzAPI.Repositories.Base;

namespace TestAzAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VideoCourseController : ControllerBase
{
    private readonly IVideoCourseRepository _videoCourseRepository;

    public VideoCourseController(IVideoCourseRepository videoCourseRepository)
    {
        _videoCourseRepository = videoCourseRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<VideoCourse>>> GetAll()
    {
        var courses = await _videoCourseRepository.GetAllAsync();
        return Ok(courses);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<VideoCourse>> GetById(Guid id)
    {
        var course = await _videoCourseRepository.GetByIdAsync(id);
        if (course == null)
            return NotFound();

        return Ok(course);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<VideoCourse>> Create(VideoCourse course)
    {
        await _videoCourseRepository.AddAsync(course);
        await _videoCourseRepository.SaveAsync();
        return CreatedAtAction(nameof(GetById), new { id = course.Id }, course);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, VideoCourse course)
    {
        if (id != course.Id)
            return BadRequest();

        _videoCourseRepository.Update(course);
        await _videoCourseRepository.SaveAsync();
        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var course = await _videoCourseRepository.GetByIdAsync(id);
        if (course == null)
            return NotFound();

        _videoCourseRepository.Delete(course);
        await _videoCourseRepository.SaveAsync();
        return NoContent();
    }
}
