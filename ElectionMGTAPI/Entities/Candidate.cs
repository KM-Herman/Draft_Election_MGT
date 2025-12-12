using ElectionMGTAPI.Enum;

namespace ElectionMGTAPI.Entities
{
    public class Candidate
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int PositionId { get; set; }
        public string Manifesto { get; set; } = string.Empty;
        public CandidateStatus Status { get; set; } = CandidateStatus.Pending;
        public int VoteCount { get; set; } = 0;

        public virtual User? User { get; set; }
        public virtual Position? Position { get; set; }
    }
}
