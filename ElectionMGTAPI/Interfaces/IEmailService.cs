namespace ElectionMGTAPI.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toIndex, string subject, string body);
    }
}

