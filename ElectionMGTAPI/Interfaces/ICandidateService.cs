namespace ElectionMGTAPI.Interfaces
{
    public interface ICandidateService
    {
        Task<(bool Success, string Error)> ApplyAsync(int userId, int positionId, string manifesto);
    }
}
