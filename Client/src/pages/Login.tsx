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
            // Decode token to get permissions
            // Simple manual decode for JWT payload (Part 2)
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const payload = JSON.parse(jsonPayload);
            // Permissions might be array or single string in claim "permissions"
            let permissions: string[] = [];
            if (Array.isArray(payload.permissions)) {
                permissions = payload.permissions;
            } else if (payload.permissions) {
                permissions = [payload.permissions];
            }

            const userId = payload.id ? parseInt(payload.id) : 0;

            const userWithPerms = {
                id: userId,
                email: email,
                name: email.split('@')[0], // Mock name fallback, or use claim if available
                profileDetails: '',
                permissions: permissions
            };

            setAuth(token, userWithPerms);
            toast.success("Welcome back!");

            // Route based on permissions
            if (permissions.includes('Permissions.CanViewAdminStats')) {
                navigate('/admin');
            } else if (permissions.includes('Permissions.CanAccessCandidateDashboard')) {
                navigate('/candidate');
            } else {
                navigate('/voter');
            }

        } catch (err: any) {
            console.error(err);
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
