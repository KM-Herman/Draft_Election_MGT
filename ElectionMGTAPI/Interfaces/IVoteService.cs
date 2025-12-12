namespace ElectionMGTAPI.Interfaces
{
    public interface IVoteService
    {
        Task<(bool Success, string Error)> CastVoteAsync(int voterId, int candidateId, int positionId);
    }
}
