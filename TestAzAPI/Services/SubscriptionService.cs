using Microsoft.EntityFrameworkCore;
using TestAzAPI.Data;
using TestAzAPI.Models;
using TestAzAPI.Repositories.Base;

namespace TestAzAPI.Services;

public interface ISubscriptionService
{
    Task<(string PaymentUrl, string PaymentId)> CreateSubscriptionAsync(Guid userId, int months);
    Task<bool> ProcessPaymentCallbackAsync(string paymentId, bool isSuccess);
    Task<bool> IsSubscriptionActiveAsync(Guid userId);
    Task<Subscription?> GetCurrentSubscriptionAsync(Guid userId);
}

public class SubscriptionService : ISubscriptionService
{
    private readonly IKapitalPayService _kapitalPayService;
    private readonly IUserRepository _userRepository;
    private readonly TestAzDbContext _context;
    private readonly ILogger<SubscriptionService> _logger;

    public SubscriptionService(
        IKapitalPayService kapitalPayService,
        IUserRepository userRepository,
        TestAzDbContext context,
        ILogger<SubscriptionService> logger)
    {
        _kapitalPayService = kapitalPayService;
        _userRepository = userRepository;
        _context = context;
        _logger = logger;
    }

    public async Task<(string PaymentUrl, string PaymentId)> CreateSubscriptionAsync(Guid userId, int months)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new ArgumentException("User not found", nameof(userId));

        const decimal monthlyPrice = 5.00m; // 5 AZN per month
        var amount = monthlyPrice * months;
        var description = $"{months} ay üçün Premium abunə";

        var (paymentUrl, paymentId) = await _kapitalPayService.CreatePaymentAsync(amount, description);

        var subscription = new Subscription
        {
            UserId = userId,
            User = user,
            Amount = amount,
            Currency = "AZN",
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddMonths(months),
            PaymentId = paymentId,
            PaymentStatus = "PENDING"
        };

        _context.Subscriptions.Add(subscription);
        await _context.SaveChangesAsync();

        return (paymentUrl, paymentId);
    }

    public async Task<bool> ProcessPaymentCallbackAsync(string paymentId, bool isSuccess)
    {
        var subscription = await _context.Subscriptions
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.PaymentId == paymentId);

        if (subscription == null)
        {
            _logger.LogError("Subscription not found for payment ID: {PaymentId}", paymentId);
            return false;
        }

        subscription.PaymentStatus = isSuccess ? "SUCCESS" : "FAILED";
        subscription.UpdatedAt = DateTime.UtcNow;

        if (isSuccess)
        {
            subscription.User.IsPremium = true;
            subscription.User.PremiumExpirationDate = subscription.EndDate;
        }
        else
        {
            subscription.PaymentError = "Payment failed";
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> IsSubscriptionActiveAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return false;

        return user.IsPremium && user.PremiumExpirationDate > DateTime.UtcNow;
    }

    public async Task<Subscription?> GetCurrentSubscriptionAsync(Guid userId)
    {
        return await _context.Subscriptions
            .Where(s => s.UserId == userId && s.EndDate > DateTime.UtcNow)
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync();
    }
} 