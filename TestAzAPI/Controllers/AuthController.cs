using Microsoft.AspNetCore.Mvc;
using TestAzAPI.Models;
using TestAzAPI.Models.Dtos;
using TestAzAPI.Repositories.Base;
using TestAzAPI.Services;
using System.Security.Cryptography;

namespace TestAzAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserRepository _userRepo;
    private readonly JwtService _jwtService;
    private readonly IEmailService _emailService;

    public AuthController(IUserRepository userRepo, JwtService jwtService, IEmailService emailService)
    {
        _userRepo = userRepo;
        _jwtService = jwtService;
        _emailService = emailService;
    }

    private string GenerateVerificationCode()
    {
        // Generate a random 4-digit code
        return Random.Shared.Next(1000, 10000).ToString();
    }

    [HttpPost("signup")]
    public async Task<IActionResult> Signup(SignupDto dto)
    {
        if (await _userRepo.ExistsAsync(dto.Email))
            return BadRequest("User already exists");

        PasswordService.CreatePasswordHash(dto.Password, out var hash, out var salt);

        var verificationCode = GenerateVerificationCode();
        var user = new User
        {
            Email = dto.Email,
            PasswordHash = hash,
            PasswordSalt = salt,
            Name = dto.Name,
            Surname = dto.Surname,
            IsEmailVerified = false,
            VerificationCode = verificationCode,
            VerificationCodeExpiry = DateTime.UtcNow.AddMinutes(15) // Code expires in 15 minutes
        };

        await _userRepo.AddAsync(user);
        await _userRepo.SaveChangesAsync();

        // Send verification email with code
        await _emailService.SendVerificationCodeAsync(user.Email, verificationCode);

        return Ok(new { message = "User registered. Please check your email for the verification code." });
    }

    [HttpPost("verify-code")]
    public async Task<IActionResult> VerifyCode([FromBody] VerifyCodeDto dto)
    {
        var user = await _userRepo.GetByEmailAsync(dto.Email);
        
        if (user == null)
            return BadRequest("User not found");

        if (user.IsEmailVerified)
            return BadRequest("Email is already verified");

        if (user.VerificationCode != dto.Code)
            return BadRequest("Invalid verification code");

        if (user.VerificationCodeExpiry < DateTime.UtcNow)
            return BadRequest("Verification code has expired");

        user.IsEmailVerified = true;
        user.VerificationCode = null;
        user.VerificationCodeExpiry = null;

        await _userRepo.SaveChangesAsync();

        return Ok(new { message = "Email verified successfully. You can now login." });
    }

    [HttpPost("resend-code")]
    public async Task<IActionResult> ResendCode([FromBody] ResendCodeDto dto)
    {
        var user = await _userRepo.GetByEmailAsync(dto.Email);
        
        if (user == null)
            return BadRequest("User not found");

        if (user.IsEmailVerified)
            return BadRequest("Email is already verified");

        var verificationCode = GenerateVerificationCode();
        user.VerificationCode = verificationCode;
        user.VerificationCodeExpiry = DateTime.UtcNow.AddMinutes(15);

        await _userRepo.SaveChangesAsync();

        await _emailService.SendVerificationCodeAsync(user.Email, verificationCode);

        return Ok(new { message = "Verification code has been resent. Please check your email." });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto login)
    {
        var user = await _userRepo.GetByEmailAsync(login.Email);
        if (user == null || !PasswordService.VerifyPassword(login.Password, user.PasswordHash, user.PasswordSalt))
            return Unauthorized("Invalid credentials");

        if (!user.IsEmailVerified)
            return Unauthorized("Please verify your email before logging in");

        var token = _jwtService.GenerateToken(user);

        return Ok(new { 
            message = "Login successful", 
            token,
            user = new {
                id = user.Id,
                email = user.Email,
                name = user.Name,
                surname = user.Surname,
                role = user.Role
            }
        });
    }

    [HttpGet("user/id/{id}")]
    public async Task<IActionResult> GetUserById(string id)
    {
        if (!Guid.TryParse(id, out Guid guidId))
            return BadRequest("Invalid user ID format");

        var user = await _userRepo.GetByIdAsync(guidId);
        if (user == null)
            return NotFound("User not found");

        return Ok(new
        {
            user.Id,
            user.Email,
            user.Name,
            user.Surname,
            user.Role,
            user.IsPremium
        });
    }
}

public class VerifyCodeDto
{
    public required string Email { get; set; }
    public required string Code { get; set; }
}

public class ResendCodeDto
{
    public required string Email { get; set; }
}
