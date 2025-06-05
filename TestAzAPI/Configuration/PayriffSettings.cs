namespace TestAzAPI.Configuration;

public class PayriffSettings
{
    public required string MerchantId { get; set; }
    public required string SecretKey { get; set; }
    public required string ApiUrl { get; set; } = "https://payriff.com/api/v2";
    public required string SuccessUrl { get; set; }
    public required string CancelUrl { get; set; }
    public required string CallbackUrl { get; set; }
} 