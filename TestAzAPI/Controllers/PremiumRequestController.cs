using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TestAzAPI.Models;
using TestAzAPI.Repositories.Base;
using System.Security.Claims;

namespace TestAzAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PremiumRequestController : ControllerBase
{
    private readonly IPremiumRequestRepository _requestRepo;
    private readonly IUserRepository _userRepo;

    public PremiumRequestController(IPremiumRequestRepository requestRepo, IUserRepository userRepo)
    {
        _requestRepo = requestRepo;
        _userRepo = userRepo;
    }

    [Authorize]
    [HttpPost("request")]
    public async Task<IActionResult> CreateRequest()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null || !Guid.TryParse(userId, out Guid userGuid))
            return Unauthorized();

        var user = await _userRepo.GetByIdAsync(userGuid);
        if (user == null)
            return NotFound("User not found");

        if (user.IsPremium)
            return BadRequest("User is already premium");

        // Check if there's already a pending request
        var existingRequest = await _requestRepo.GetPendingRequestsAsync();
        if (existingRequest.Any(r => r.UserId == userGuid))
            return BadRequest("You already have a pending premium request");

        var request = new PremiumRequest
        {
            UserId = userGuid,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        await _requestRepo.AddAsync(request);
        await _requestRepo.SaveChangesAsync();

        return Ok(new { message = "Premium request created successfully" });
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("requests")]
    public async Task<IActionResult> GetRequests()
    {
        var requests = await _requestRepo.GetPendingRequestsAsync();
        return Ok(requests.Select(r => new
        {
            r.Id,
            r.UserId,
            UserName = $"{r.User.Name} {r.User.Surname}",
            UserEmail = r.User.Email,
            r.Status,
            r.CreatedAt,
            r.ProcessedAt,
            r.ProcessedBy,
            r.RejectionReason
        }));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("{id}/approve")]
    public async Task<IActionResult> ApproveRequest(Guid id)
    {
        var request = await _requestRepo.GetRequestWithUserAsync(id);
        if (request == null)
            return NotFound("Request not found");

        if (request.Status != "Pending")
            return BadRequest("Request is not pending");

        var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (adminId == null)
            return Unauthorized();

        request.Status = "Approved";
        request.ProcessedAt = DateTime.UtcNow;
        request.ProcessedBy = adminId;

        request.User.IsPremium = true;
        request.User.PremiumExpirationDate = DateTime.UtcNow.AddMonths(1);

        await _requestRepo.SaveChangesAsync();

        return Ok(new { message = "Request approved successfully" });
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("{id}/reject")]
    public async Task<IActionResult> RejectRequest(Guid id, [FromBody] RejectRequestDto dto)
    {
        var request = await _requestRepo.GetRequestWithUserAsync(id);
        if (request == null)
            return NotFound("Request not found");

        if (request.Status != "Pending")
            return BadRequest("Request is not pending");

        var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (adminId == null)
            return Unauthorized();

        request.Status = "Rejected";
        request.ProcessedAt = DateTime.UtcNow;
        request.ProcessedBy = adminId;
        request.RejectionReason = dto.Reason;

        await _requestRepo.SaveChangesAsync();

        return Ok(new { message = "Request rejected successfully" });
    }
}

public class RejectRequestDto
{
    public string? Reason { get; set; }
} 