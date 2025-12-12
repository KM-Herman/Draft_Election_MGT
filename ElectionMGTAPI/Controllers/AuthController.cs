using ElectionMGTAPI.DTOs;
using ElectionMGTAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ElectionMGTAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var result = await _authService.LoginAsync(request.Email, request.Password);
            if (!result.Success)
            {
                return Unauthorized(new { error = result.Error });
            }
            return Ok(new AuthResponse(result.Token, string.Empty));
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            var result = await _authService.RegisterAsync(request.Name, request.Email, request.Password);
            if (!result.Success)
            {
                return BadRequest(new { error = result.Error });
            }
            return Ok("User registered successfully");
        }
    }
}
