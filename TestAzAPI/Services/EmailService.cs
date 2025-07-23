using System.Net.Mail;
using Microsoft.Extensions.Configuration;

namespace TestAzAPI.Services;

public class EmailService : IEmailService
{
    private readonly string _smtpServer;
    private readonly int _smtpPort;
    private readonly string _smtpUsername;
    private readonly string _smtpPassword;
    private readonly string _fromEmail;
    private readonly string _baseUrl;

    public EmailService()
    {
        _smtpServer = Environment.GetEnvironmentVariable("Email__SmtpServer") ?? throw new InvalidOperationException("Email__SmtpServer not found in environment variables");
        _smtpPort = int.Parse(Environment.GetEnvironmentVariable("Email__SmtpPort") ?? throw new InvalidOperationException("Email__SmtpPort not found in environment variables"));
        _smtpUsername = Environment.GetEnvironmentVariable("Email__SmtpUsername") ?? throw new InvalidOperationException("Email__SmtpUsername not found in environment variables");
        _smtpPassword = Environment.GetEnvironmentVariable("Email__SmtpPassword") ?? throw new InvalidOperationException("Email__SmtpPassword not found in environment variables");
        _fromEmail = Environment.GetEnvironmentVariable("Email__FromEmail") ?? throw new InvalidOperationException("Email__FromEmail not found in environment variables");
        _baseUrl = Environment.GetEnvironmentVariable("App__BaseUrl") ?? throw new InvalidOperationException("App__BaseUrl not found in environment variables");
    }

    public async Task SendVerificationEmailAsync(string to, string verificationToken)
    {
        var verificationLink = $"{_baseUrl}/api/auth/verify-email?token={verificationToken}";
        
        var subject = "Verify your email address";
        var body = $@"
            <h2>Welcome to TestAz!</h2>
            <p>Please verify your email address by clicking the link below:</p>
            <p><a href='{verificationLink}'>Verify Email Address</a></p>
            <p>If you did not create an account, you can safely ignore this email.</p>
            <p>This link will expire in 24 hours.</p>";

        using var client = new SmtpClient(_smtpServer, _smtpPort)
        {
            EnableSsl = true,
            Credentials = new System.Net.NetworkCredential(_smtpUsername, _smtpPassword)
        };

        var message = new MailMessage
        {
            From = new MailAddress(_fromEmail),
            Subject = subject,
            Body = body,
            IsBodyHtml = true
        };
        message.To.Add(to);

        await client.SendMailAsync(message);
    }

    public async Task SendVerificationCodeAsync(string email, string code)
    {
        using var client = new SmtpClient(_smtpServer, _smtpPort)
        {
            EnableSsl = true,
            Credentials = new System.Net.NetworkCredential(_smtpUsername, _smtpPassword)
        };

        var message = new MailMessage
        {
            From = new MailAddress(_fromEmail, "TestAz"),
            Subject = "Verify Your Email",
            Body = $@"
                <html>
                    <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                        <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                            <h2 style='color: #2c3e50;'>Welcome to TestAz!</h2>
                            <p>Thank you for signing up. To verify your email address, please use the following verification code:</p>
                            <div style='background-color: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;'>
                                <h1 style='color: #2c3e50; margin: 0; font-size: 32px; letter-spacing: 5px;'>{code}</h1>
                            </div>
                            <p>This code will expire in 15 minutes.</p>
                            <p>If you didn't request this verification code, please ignore this email.</p>
                            <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'>
                            <p style='color: #666; font-size: 12px;'>This is an automated message, please do not reply to this email.</p>
                        </div>
                    </body>
                </html>",
            IsBodyHtml = true
        };

        message.To.Add(email);

        await client.SendMailAsync(message);
    }
} 