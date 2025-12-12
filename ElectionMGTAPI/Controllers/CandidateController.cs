using ElectionMGTAPI.Constant;
using ElectionMGTAPI.Data;
using ElectionMGTAPI.DTOs;
using ElectionMGTAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ElectionMGTAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CandidateController : ControllerBase
    {
        private readonly ICandidateService _candidateService;
        private readonly AppDbContext _context;

        public CandidateController(ICandidateService candidateService, AppDbContext context)
        {
            _candidateService = candidateService;
            _context = context;
        }

        private int GetUserId() => int.Parse(User.FindFirst("id")?.Value ?? "0");

        [HttpPost("apply")]
        [Authorize(Policy = Permissions.CanApplyForCandidacy)]
        public async Task<IActionResult> Apply(CandidateApplicationRequest request)
        {
            var userId = GetUserId();
            var result = await _candidateService.ApplyAsync(userId, request.PositionId, request.Manifesto);

            if (!result.Success) return BadRequest(result.Error);
            return Ok(result.Error); // Success message is in Error field? Refactor tuple.
            // Wait, tuple is (Success, Error). If Success, Error might be message or empty.
            // Service returned message in Error field for success, let's fix that or use it.
            // "Application approved automaticlly." in Error.
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var userId = GetUserId();
            var candidate = await _context.Candidates.FirstOrDefaultAsync(c => c.UserId == userId);

            if (candidate == null) return NotFound("You are not a candidate.");

            // Rank logic: Count how many candidates in same position have more votes.
            var rank = await _context.Candidates
                .Where(c => c.PositionId == candidate.PositionId && c.VoteCount > candidate.VoteCount)
                .CountAsync() + 1;

            return Ok(new CandidateStatsResponse(rank, candidate.VoteCount));
        }
    }
}
