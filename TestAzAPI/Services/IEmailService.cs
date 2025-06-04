namespace TestAzAPI.Services;

public interface IEmailService
{
    Task SendVerificationCodeAsync(string email, string code);
} 