using ElectionMGTAPI.Constant;
using ElectionMGTAPI.Entities;
using Microsoft.EntityFrameworkCore;

namespace ElectionMGTAPI.Data
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            await context.Database.EnsureCreatedAsync();

            if (!await context.Permissions.AnyAsync())
            {
                var perms = Permissions.All.Select(p => new Permission { Name = p }).ToList();
                context.Permissions.AddRange(perms);
                await context.SaveChangesAsync();
            }

            if (!await context.Roles.AnyAsync())
            {
                var adminRole = new Role { Name = "Admin" };
                var voterRole = new Role { Name = "Voter" };

                context.Roles.AddRange(adminRole, voterRole);
                await context.SaveChangesAsync();

                var allPerms = await context.Permissions.ToListAsync();

                foreach (var p in allPerms)
                {
                    context.RolePermissions.Add(new RolePermission { RoleId = adminRole.Id, PermissionId = p.Id });
                }

                var voterPerms = allPerms.Where(p =>
                    p.Name == Permissions.CanVote ||
                    p.Name == Permissions.CanViewDashboard ||
                    p.Name == Permissions.CanApplyForCandidacy
                ).ToList();

                foreach (var p in voterPerms)
                {
                    context.RolePermissions.Add(new RolePermission { RoleId = voterRole.Id, PermissionId = p.Id });
                }

                await context.SaveChangesAsync();
            }

            if (!await context.Users.AnyAsync(u => u.Email == "admin@election.com"))
            {
                var adminUser = new User
                {
                    Name = "Admin User",
                    Email = "admin@election.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    IsActive = true
                };
                context.Users.Add(adminUser);
                await context.SaveChangesAsync();

                var adminRole = await context.Roles.FirstAsync(r => r.Name == "Admin");
                context.UserRoles.Add(new UserRole { UserId = adminUser.Id, RoleId = adminRole.Id });
                await context.SaveChangesAsync();
            }
        }
    }
}
