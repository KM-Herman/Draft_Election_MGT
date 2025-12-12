using ElectionMGTAPI.Data;
using ElectionMGTAPI.Entities;
using ElectionMGTAPI.Enum;
using ElectionMGTAPI.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ElectionMGTAPI.Services
{
    public class CandidateService : ICandidateService
    {
        private readonly AppDbContext _context;

        public CandidateService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<(bool Success, string Error)> ApplyAsync(int userId, int positionId, string manifesto, string degree, bool hasBeenInJail, string maritalStatus, string nationalId)
        {
            // Check if already applied
            var existing = await _context.Candidates.FirstOrDefaultAsync(c => c.UserId == userId && c.PositionId == positionId);
            if (existing != null)
            {
                return (false, "You have already applied for this position.");
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return (false, "User not found.");

            // Automatic Rejection Rule
            if (hasBeenInJail)
            {
                // Can record it as Denied for history or just block.
                // Let's create it as Denied.
            }

            var candidate = new Candidate
            {
                UserId = userId,
                PositionId = positionId,
                Manifesto = manifesto,
                // New Fields
                Degree = degree,
                HasBeenInJail = hasBeenInJail,
                MaritalStatus = maritalStatus,
                NationalId = nationalId,
                // Logic: Refined to Pending for Admin Review, unless jail -> Denied
                Status = hasBeenInJail ? CandidateStatus.Denied : CandidateStatus.Pending,
                VoteCount = 0
            };

            _context.Candidates.Add(candidate);
            await _context.SaveChangesAsync();

            if (candidate.Status == CandidateStatus.Denied)
                return (true, "Application denied automatically due to criminal record.");
            
            return (true, "Application submitted successfully. Pending Admin approval.");
        }
    }
}
