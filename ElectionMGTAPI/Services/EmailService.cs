using ElectionMGTAPI.Interfaces;

namespace ElectionMGTAPI.Services
{
    public class EmailService : IEmailService
    {
        private readonly ILogger<EmailService> _logger;

        public EmailService(ILogger<EmailService> logger)
        {
            _logger = logger;
        }

        public Task SendEmailAsync(string to, string subject, string body)
        {
            _logger.LogInformation($"[Mock Email Service] Sending email to {to} | Subject: {subject} | Body: {body}");
            return Task.CompletedTask;
        }
    }
}
