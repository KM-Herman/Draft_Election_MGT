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

        public async Task<(bool Success, string Error)> ApplyAsync(int userId, int positionId, string manifesto)
        {
            // Check if already applied
            var existing = await _context.Candidates.FirstOrDefaultAsync(c => c.UserId == userId && c.PositionId == positionId);
            if (existing != null)
            {
                return (false, "You have already applied for this position.");
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return (false, "User not found.");

            // Mock profile completeness check
            // Requirement: "If the user profile is complete (mock logic), set Status to Approved, otherwise Denied."
            // Logic: ProfileDetails not null and not empty.
            bool isProfileComplete = !string.IsNullOrWhiteSpace(user.ProfileDetails);

            var candidate = new Candidate
            {
                UserId = userId,
                PositionId = positionId,
                Manifesto = manifesto,
                Status = isProfileComplete ? CandidateStatus.Approved : CandidateStatus.Denied,
                VoteCount = 0
            };

            _context.Candidates.Add(candidate);
            await _context.SaveChangesAsync();

            return (true, isProfileComplete ? "Application approved automaticlly." : "Application denied due to incomplete profile.");
        }
    }
}
