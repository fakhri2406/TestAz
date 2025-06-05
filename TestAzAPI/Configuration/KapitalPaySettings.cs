namespace TestAzAPI.Configuration;

public class KapitalPaySettings
{
    public required string MerchantId { get; set; }
    public required string TerminalId { get; set; }
    public required string ApiUrl { get; set; } = "https://tstpg.kapitalbank.az:5443/Exec";
    public required string SuccessUrl { get; set; }
    public required string CancelUrl { get; set; }
} 