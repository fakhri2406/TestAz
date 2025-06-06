using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using TestAzAPI.Configuration;
using TestAzAPI.Models;

namespace TestAzAPI.Services;

public interface IPayriffService
{
    Task<(string PaymentUrl, string PaymentId)> CreatePaymentAsync(decimal amount, string currency, string description);
    Task<bool> VerifyPaymentAsync(string paymentId);
    Task<PaymentStatus> GetPaymentStatusAsync(string paymentId);
}

public class PayriffService : IPayriffService
{
    private readonly HttpClient _httpClient;
    private readonly PayriffSettings _settings;
    private readonly ILogger<PayriffService> _logger;

    public PayriffService(
        HttpClient httpClient,
        IOptions<PayriffSettings> settings,
        ILogger<PayriffService> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;
        
        _httpClient.BaseAddress = new Uri(_settings.ApiUrl);
        _httpClient.DefaultRequestHeaders.Add("Merchant-Id", _settings.MerchantId);
    }

    public async Task<(string PaymentUrl, string PaymentId)> CreatePaymentAsync(decimal amount, string currency, string description)
    {
        try
        {
            var paymentId = Guid.NewGuid().ToString();
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString();
            
            var paymentData = new
            {
                amount = amount.ToString("0.00"),
                currency = currency,
                description = description,
                paymentId = paymentId,
                successUrl = _settings.SuccessUrl,
                cancelUrl = _settings.CancelUrl,
                callbackUrl = _settings.CallbackUrl,
                timestamp = timestamp
            };

            var signature = GenerateSignature(paymentData);
            
            var request = new
            {
                payment = paymentData,
                signature = signature
            };

            var response = await _httpClient.PostAsJsonAsync("/create-payment", request);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<PayriffResponse>();
            if (result?.PaymentUrl == null)
                throw new Exception("Failed to get payment URL from Payriff");

            return (result.PaymentUrl, paymentId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating payment with Payriff");
            throw;
        }
    }

    public async Task<bool> VerifyPaymentAsync(string paymentId)
    {
        try
        {
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString();
            var verifyData = new
            {
                paymentId = paymentId,
                timestamp = timestamp
            };

            var signature = GenerateSignature(verifyData);
            
            var request = new
            {
                payment = verifyData,
                signature = signature
            };

            var response = await _httpClient.PostAsJsonAsync("/verify-payment", request);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<PayriffVerifyResponse>();
            return result?.Status == "SUCCESS";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying payment with Payriff");
            throw;
        }
    }

    public async Task<PaymentStatus> GetPaymentStatusAsync(string paymentId)
    {
        try
        {
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString();
            var statusData = new
            {
                paymentId = paymentId,
                timestamp = timestamp
            };

            var signature = GenerateSignature(statusData);
            
            var request = new
            {
                payment = statusData,
                signature = signature
            };

            var response = await _httpClient.PostAsJsonAsync("/payment-status", request);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<PayriffStatusResponse>();
            return MapPaymentStatus(result?.Status ?? "UNKNOWN");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting payment status from Payriff");
            throw;
        }
    }

    private string GenerateSignature(object data)
    {
        var json = JsonSerializer.Serialize(data);
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_settings.SecretKey));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(json));
        return Convert.ToBase64String(hash);
    }

    private PaymentStatus MapPaymentStatus(string payriffStatus)
    {
        return payriffStatus.ToUpper() switch
        {
            "SUCCESS" => PaymentStatus.Success,
            "PENDING" => PaymentStatus.Pending,
            "CANCELLED" => PaymentStatus.Cancelled,
            "FAILED" => PaymentStatus.Failed,
            _ => PaymentStatus.Unknown
        };
    }
}

public class PayriffResponse
{
    public string? PaymentUrl { get; set; }
    public string? Status { get; set; }
}

public class PayriffVerifyResponse
{
    public string? Status { get; set; }
}

public class PayriffStatusResponse
{
    public string? Status { get; set; }
}

public enum PaymentStatus
{
    Unknown,
    Pending,
    Success,
    Failed,
    Cancelled
} 