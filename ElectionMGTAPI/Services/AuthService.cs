using ElectionMGTAPI.Data;
using ElectionMGTAPI.Entities;
using ElectionMGTAPI.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ElectionMGTAPI.Services
{
    public class AuthService(AppDbContext context, ITokenService tokenService) : IAuthService
    {
        private readonly AppDbContext _context = context;
        private readonly ITokenService _tokenService = tokenService;

        public async Task<(bool Success, string Token, string Error)> LoginAsync(string email, string password)
        {
            var user = await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .ThenInclude(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            {
                return (false, string.Empty, "Invalid credentials");
            }

            if (!user.IsActive)
                return (false, string.Empty, "Account is inactive");

            // Aggregate permissions
            var permissions = user.UserRoles
                .SelectMany(ur => ur.Role!.RolePermissions)
                .Select(rp => rp.Permission!.Name)
                .Distinct()
                .ToList();

            var token = _tokenService.GenerateToken(user, permissions);

            return (true, token, string.Empty);
        }

        public async Task<(bool Success, User? User, string Error)> RegisterAsync(string name, string email, string password)
        {
            if (await _context.Users.AnyAsync(u => u.Email == email))
            {
                return (false, null, "Email already exists");
            }

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);

            var user = new User
            {
                Name = name,
                Email = email,
                PasswordHash = passwordHash,
                IsActive = true
            };

            _context.Users.Add(user);

            // Assign default "Voter" role if exists, logic can be added here.
            // Assuming we have a "Voter" role seeded with Id 2 or Name "Voter".
            // Implementation: Find role by name "Voter", add to UserRoles.
            var voterRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Voter");
            if (voterRole != null)
            {
                user.UserRoles.Add(new UserRole { Role = voterRole });
            }

            await _context.SaveChangesAsync();

            return (true, user, string.Empty);
        }

        public async Task<(bool Success, string Token, string Error)> RefreshTokenAsync(int userId)
        {
            var user = await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .ThenInclude(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null || !user.IsActive)
                return (false, string.Empty, "User not found or inactive");

            // Aggregate fresh permissions
            var permissions = user.UserRoles
                .SelectMany(ur => ur.Role!.RolePermissions)
                .Select(rp => rp.Permission!.Name)
                .Distinct()
                .ToList();

            var token = _tokenService.GenerateToken(user, permissions);

            return (true, token, string.Empty);
        }
    }
}
