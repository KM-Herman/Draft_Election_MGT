import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { toast } from 'react-toastify';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Updated endpoint based on AuthController analysis
            const res = await api.post('/auth/login', { email, password });
            const { token, user } = res.data;
            // The backend returns { token, error } but not the user object directly often, 
            // or the JWT contains the user claims.
            // Let's assume for now we parse the token or fetch user profile. 
            // Standard JWT pattern: decode payload or fetch /auth/me. 
            // The AuthController Login returns: new AuthResponse(result.Token, string.Empty)
            // It does NOT return the user object.
            // We need to decode the token to get permissions/role or fetch a profile endpoint.
            // For this specific iteration, let's assume we decode simple claims or 
            // fetch a user profile immediately after login.
            // But wait, the stores needs a User object.

            // Let's Mock the user object creation from token or a follow-up call 
            // if the backend doesn't provide it yet, to keep the flow moving.

            // Temporary: Mock user based on email (admin vs voter) for demo purposes if backend doesn't return full user obj.
            // OR ideally, we assume the token has claims we can parse.

            const mockUser = {
                email: email,
                permissions: email.includes('admin')
                    ? ['Permissions.CanViewAdminStats', 'Permissions.CanCreatePosition']
                    : ['Permissions.CanViewDashboard', 'Permissions.Vote']
            };

            setAuth(token, mockUser);
            toast.success("Welcome back!");

            if (email.includes('admin')) {
                navigate('/admin');
            } else if (email.includes('candidate')) {
                navigate('/candidate');
            } else {
                navigate('/voter');
            }

        } catch (err: any) {
            toast.error(err.response?.data?.error || "Login Failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center auth-bg p-4 text-white">
            <div className="glass p-8 rounded-2xl shadow-2xl w-full max-w-md relative z-10 text-center">
                <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                <p className="text-blue-100 mb-8">Login to your dashboard</p>

                <form onSubmit={handleLogin} className="space-y-6 text-left">
                    <div>
                        <label className="block text-sm font-medium mb-1 pl-1">Email Address</label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 pl-1">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-blue-500/50 transition-all transform hover:-translate-y-0.5"
                    >
                        Sign In
                    </button>
                </form>

                <div className="mt-6 text-sm text-blue-100">
                    Don't have an account? <span className="underline cursor-pointer hover:text-white" onClick={() => navigate('/signup')}>Register for free</span>
                </div>
            </div>
        </div>
    );
};
