using System.Net.Http.Json;
using System.Text;
using System.Xml.Linq;
using Microsoft.Extensions.Options;
using TestAzAPI.Configuration;

namespace TestAzAPI.Services;

public interface IKapitalPayService
{
    Task<(string PaymentUrl, string PaymentId)> CreatePaymentAsync(decimal amount, string description);
    Task<bool> VerifyPaymentAsync(string paymentId);
}

public class KapitalPayService : IKapitalPayService
{
    private readonly HttpClient _httpClient;
    private readonly KapitalPaySettings _settings;
    private readonly ILogger<KapitalPayService> _logger;

    public KapitalPayService(
        HttpClient httpClient,
        IOptions<KapitalPaySettings> settings,
        ILogger<KapitalPayService> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<(string PaymentUrl, string PaymentId)> CreatePaymentAsync(decimal amount, string description)
    {
        try
        {
            var paymentId = Guid.NewGuid().ToString();
            
            // Create XML request for Kapital Pay
            var xmlRequest = new XDocument(
                new XElement("TKKPG",
                    new XElement("Request",
                        new XElement("Operation", "CreateOrder"),
                        new XElement("Language", "AZ"),
                        new XElement("Order",
                            new XElement("Merchant", _settings.MerchantId),
                            new XElement("OrderID", paymentId),
                            new XElement("Amount", amount.ToString("0.00")),
                            new XElement("Currency", "944"), // AZN currency code
                            new XElement("Description", description),
                            new XElement("ApproveURL", _settings.SuccessUrl),
                            new XElement("CancelURL", _settings.CancelUrl),
                            new XElement("DeclineURL", _settings.CancelUrl)
                        )
                    )
                )
            );

            var content = new StringContent(xmlRequest.ToString(), Encoding.UTF8, "application/xml");
            var response = await _httpClient.PostAsync(_settings.ApiUrl, content);
            response.EnsureSuccessStatusCode();

            var responseXml = await response.Content.ReadAsStringAsync();
            var xDoc = XDocument.Parse(responseXml);
            
            var orderStatus = xDoc.Descendants("Status").FirstOrDefault()?.Value;
            if (orderStatus != "00")
            {
                throw new Exception($"Payment creation failed with status: {orderStatus}");
            }

            var sessionId = xDoc.Descendants("SessionID").FirstOrDefault()?.Value;
            if (string.IsNullOrEmpty(sessionId))
            {
                throw new Exception("Failed to get session ID from Kapital Pay");
            }

            // Construct payment URL
            var paymentUrl = $"https://tstpg.kapitalbank.az:5443/Payment/Web/Pay?sessionID={sessionId}";

            return (paymentUrl, paymentId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating payment with Kapital Pay");
            throw;
        }
    }

    public async Task<bool> VerifyPaymentAsync(string paymentId)
    {
        try
        {
            var xmlRequest = new XDocument(
                new XElement("TKKPG",
                    new XElement("Request",
                        new XElement("Operation", "GetOrderStatus"),
                        new XElement("Language", "AZ"),
                        new XElement("Order",
                            new XElement("Merchant", _settings.MerchantId),
                            new XElement("OrderID", paymentId)
                        )
                    )
                )
            );

            var content = new StringContent(xmlRequest.ToString(), Encoding.UTF8, "application/xml");
            var response = await _httpClient.PostAsync(_settings.ApiUrl, content);
            response.EnsureSuccessStatusCode();

            var responseXml = await response.Content.ReadAsStringAsync();
            var xDoc = XDocument.Parse(responseXml);
            
            var orderStatus = xDoc.Descendants("Status").FirstOrDefault()?.Value;
            return orderStatus == "00"; // 00 means success in Kapital Pay
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying payment with Kapital Pay");
            throw;
        }
    }
} 