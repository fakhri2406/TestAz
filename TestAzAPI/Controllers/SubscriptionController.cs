using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TestAzAPI.Models;
using TestAzAPI.Services;

namespace TestAzAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SubscriptionController : ControllerBase
{
    private readonly ISubscriptionService _subscriptionService;
    private readonly ILogger<SubscriptionController> _logger;

    public SubscriptionController(
        ISubscriptionService subscriptionService,
        ILogger<SubscriptionController> logger)
    {
        _subscriptionService = subscriptionService;
        _logger = logger;
    }

    [HttpPost("create")]
    public async Task<IActionResult> CreateSubscription([FromBody] CreateSubscriptionDto dto)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst("id")?.Value ?? throw new UnauthorizedAccessException());
            var (paymentUrl, paymentId) = await _subscriptionService.CreateSubscriptionAsync(userId, dto.Months);

            return Ok(new { paymentUrl, paymentId });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating subscription");
            return BadRequest(new { message = "Abunə yaradılması zamanı xəta baş verdi" });
        }
    }

    [HttpPost("callback")]
    [AllowAnonymous]
    public async Task<IActionResult> PaymentCallback([FromQuery] string orderId, [FromQuery] string status)
    {
        try
        {
            var isSuccess = status == "00"; // Kapital Pay success status code
            var success = await _subscriptionService.ProcessPaymentCallbackAsync(orderId, isSuccess);
            if (!success)
                return BadRequest(new { message = "Ödəniş emal edilə bilmədi" });

            return Ok(new { message = "Ödəniş uğurla emal edildi" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing payment callback");
            return BadRequest(new { message = "Ödəniş emal edilə bilmədi" });
        }
    }

    [HttpGet("status")]
    public async Task<IActionResult> GetSubscriptionStatus()
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst("id")?.Value ?? throw new UnauthorizedAccessException());
            var isActive = await _subscriptionService.IsSubscriptionActiveAsync(userId);
            var subscription = await _subscriptionService.GetCurrentSubscriptionAsync(userId);

            return Ok(new
            {
                isActive,
                subscription = subscription == null ? null : new
                {
                    subscription.StartDate,
                    subscription.EndDate,
                    subscription.Amount,
                    subscription.Currency,
                    subscription.PaymentStatus
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting subscription status");
            return BadRequest(new { message = "Abunə statusu alına bilmədi" });
        }
    }
}

public class CreateSubscriptionDto
{
    public required int Months { get; set; }
} 