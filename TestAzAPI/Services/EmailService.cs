using System.Net.Mail;
using Microsoft.Extensions.Configuration;

namespace TestAzAPI.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly string _smtpServer;
    private readonly int _smtpPort;
    private readonly string _smtpUsername;
    private readonly string _smtpPassword;
    private readonly string _fromEmail;
    private readonly string _baseUrl;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
        _smtpServer = _configuration["Email:SmtpServer"]!;
        _smtpPort = int.Parse(_configuration["Email:SmtpPort"]!);
        _smtpUsername = _configuration["Email:SmtpUsername"]!;
        _smtpPassword = _configuration["Email:SmtpPassword"]!;
        _fromEmail = _configuration["Email:FromEmail"]!;
        _baseUrl = _configuration["App:BaseUrl"]!;
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