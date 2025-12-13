using ElectionMGTAPI.Entities;

namespace ElectionMGTAPI.Interfaces
{
    public interface IAuthService
    {
        Task<(bool Success, string Token, string Error)> LoginAsync(string email, string password);
        Task<(bool Success, User? User, string Error)> RegisterAsync(string name, string email, string password);
        Task<(bool Success, string Token, string Error)> RefreshTokenAsync(int userId);
    }
}
