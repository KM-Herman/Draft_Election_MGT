using ElectionMGTAPI.Entities;

namespace ElectionMGTAPI.Interfaces
{
    public interface ITokenService
    {
        string GenerateToken(User user, List<string> permissions);
    }
}
