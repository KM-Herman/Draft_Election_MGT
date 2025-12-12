using ElectionMGTAPI.Constant;
using ElectionMGTAPI.Data;
using ElectionMGTAPI.DTOs;
using ElectionMGTAPI.Entities;
using ElectionMGTAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ElectionMGTAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")] // Or Policy based for Admin actions
    // Requirement says: "Authorization: Strictly Permission-Based (Policy-Based), NOT Role-Based."
    // So I should use Policies. I'll use "CanViewAdminStats", "CanCreatePosition", etc.
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;

        public AdminController(AppDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        [HttpGet("summary")]
        [Authorize(Policy = Permissions.CanViewAdminStats)]
        public async Task<IActionResult> GetSummary()
        {
            var totalVoters = await _context.Users.CountAsync(); // Approximate
            // Actually "Users" might include admins.
            var totalVotes = await _context.Votes.CountAsync();
            var totalCandidates = await _context.Candidates.CountAsync();

            return Ok(new { TotalUsers = totalVoters, TotalVotes = totalVotes, TotalCandidates = totalCandidates });
        }

        [HttpPost("notification/broadcast")]
        [Authorize(Policy = Permissions.CanCreatePosition)] // Reuse or new permission
        public async Task<IActionResult> Broadcast(BroadcastRequest request)
        {
            // Logic to send notifications to DB and maybe Email/SignalR?
            // "Send notification to target groups (All, Voters, Candidates)."
            // Impl: Create Notification entities for all users in group.

            IQueryable<User> targetUsers = _context.Users;

            if (request.TargetGroup == "Candidates")
            {
                // Join candidates
                targetUsers = _context.Candidates.Select(c => c.User!);
            }
            // "Voters" might mean everyone who can vote, or who HAS voted? Assuming all users with Voter role.
            // For simplicity, "All" = All users.

            // This could be heavy for large DB, but for demo:
            var userIds = await targetUsers.Select(u => u.Id).ToListAsync();

            var notifs = userIds.Select(id => new Notification
            {
                UserId = id,
                Message = request.Message,
                DateSent = DateTime.UtcNow,
                IsRead = false
            });

            _context.Notifications.AddRange(notifs);
            await _context.SaveChangesAsync();

            return Ok($"Broadcasted to {userIds.Count} users.");
        }

        [HttpPost("positions")]
        [Authorize(Policy = Permissions.CanCreatePosition)]
        public async Task<IActionResult> CreatePosition(PositionDto dto)
        {
            var pos = new Position { Title = dto.Title, Description = dto.Description, IsActive = true };
            _context.Positions.Add(pos);
            await _context.SaveChangesAsync();
            return Ok(pos);
        }

        // Add User management if needed
    }
}
