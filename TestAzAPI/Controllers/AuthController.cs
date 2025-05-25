using Microsoft.AspNetCore.Mvc;
using TestAzAPI.Models;
using TestAzAPI.Models.Dtos;
using TestAzAPI.Repositories.Base;
using TestAzAPI.Services;

namespace TestAzAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserRepository _userRepo;

    public AuthController(IUserRepository userRepo)
    {
        _userRepo = userRepo;
    }

    [HttpPost("signup")]
    public async Task<IActionResult> Signup(SignupDto dto)
    {
        if (await _userRepo.ExistsAsync(dto.Email))
            return BadRequest("User already exists");

        PasswordService.CreatePasswordHash(dto.Password, out var hash, out var salt);

        var user = new User
        {
            Email = dto.Email,
            PasswordHash = hash,
            PasswordSalt = salt,
            Name = dto.Name,
            Surname = dto.Surname
        };

        await _userRepo.AddAsync(user);
        await _userRepo.SaveChangesAsync();

        return Ok(new { message = "User registered" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto login)
    {
        var user = await _userRepo.GetByEmailAsync(login.Email);
        if (user == null || !PasswordService.VerifyPassword(login.Password, user.PasswordHash, user.PasswordSalt))
            return Unauthorized("Invalid credentials");

        return Ok(new { message = "Login successful", user.Id, user.Email });
    }

    [HttpGet("user/id/{id}")]
    public async Task<IActionResult> GetUserById(Guid id)
    {
        var user = await _userRepo.GetByIdAsync(id);
        if (user == null)
            return NotFound("User not found");

        return Ok(new
        {
            user.Id,
            user.Email,
            user.Name,
            user.Surname,
            user.Role
        });
    }
}
