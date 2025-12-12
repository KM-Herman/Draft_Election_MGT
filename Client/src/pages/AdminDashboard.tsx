import React, { useEffect, useState } from 'react';
import api, { UserDto, AuditLog, PendingCandidate } from '../services/api';
import { toast } from 'react-toastify';
import { LiveChart } from '../components/LiveChart';

interface AdminStats {
    totalUsers: number;
    totalVotes: number;
    totalCandidates: number;
}

export const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, totalVotes: 0, totalCandidates: 0 });
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [newPosition, setNewPosition] = useState({ title: '', description: '' });
    const [users, setUsers] = useState<UserDto[]>([]);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [pendingCandidates, setPendingCandidates] = useState<PendingCandidate[]>([]);
    const [targetGroup, setTargetGroup] = useState('All');

    useEffect(() => {
        fetchStats();
        fetchUsers();
        fetchLogs();
        fetchPendingCandidates();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/summary');
            setStats(res.data);
        } catch (err) {
            console.error("Failed to fetch stats", err);
            // Fallback for demo if API fails
            setStats({ totalUsers: 120, totalVotes: 450, totalCandidates: 8 });
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchLogs = async () => {
        try {
            const res = await api.get('/admin/logs');
            setLogs(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPendingCandidates = async () => {
        try {
            const res = await api.get('/admin/candidates/pending');
            setPendingCandidates(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateRole = async (userId: number, currentRole: string) => {
        const newRole = prompt("Enter new role (Admin, Voter, Candidate):", currentRole);
        if (newRole && newRole !== currentRole) {
            try {
                await api.put(`/admin/users/${userId}/role`, { roleName: newRole });
                toast.success("User role updated");
                fetchUsers();
            } catch (err) {
                console.error(err);
                toast.error("Failed to update role");
            }
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await api.delete(`/admin/users/${userId}`);
                toast.success("User deleted");
                fetchUsers();
            } catch (err) {
                console.error(err);
                toast.error("Failed to delete user");
            }
        }
    };

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/admin/notification/broadcast', {
                targetGroup: targetGroup, // Using state
                message: broadcastMessage
            });
            toast.success("Broadcast Sent!");
            setBroadcastMessage('');
        } catch (err) {
            toast.error("Broadcast failed");
        }
    };

    const handleCreatePosition = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/admin/positions', newPosition);
            toast.success("Position Created!");
            setNewPosition({ title: '', description: '' });
        } catch (err) {
            toast.error("Failed to create position");
        }
    };

    const handleApproveCandidate = async (candidateId: number) => {
        try {
            await api.put(`/admin/candidates/${candidateId}/approve`);
            toast.success("Candidate Approved");
            fetchPendingCandidates();
            fetchStats(); // Update stats as candidate count increases
        } catch (err) {
            toast.error("Failed to approve candidate");
        }
    };

    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'election' | 'notifications'>('overview');

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex space-x-4 border-b">
                {['overview', 'users', 'election', 'notifications'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`py-2 px-4 font-medium capitalize focus:outline-none transition-colors ${activeTab === tab
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab === 'users' ? 'User Management' : tab === 'election' ? 'Election Management' : tab}
                    </button>
                ))}
            </div>

            {/* Content Sections */}
            <div className="mt-6">
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <StatCard title="Total Voters" value={stats.totalUsers} color="bg-blue-500" />
                            <StatCard title="Votes Cast" value={stats.totalVotes} color="bg-purple-500" />
                            <StatCard title="Candidates" value={stats.totalCandidates} color="bg-green-500" />
                            <StatCard title="Participation" value="78%" color="bg-orange-400" />
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-lg font-bold mb-4 text-gray-700">Live Election Results</h3>
                            <LiveChart />
                        </div>

                        {/* Recent System Logs */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-lg font-bold mb-4 text-gray-700">Recent System Logs</h3>
                            <div className="max-h-60 overflow-y-auto space-y-3">
                                {logs.length === 0 ? <p className="text-gray-500">No logs available.</p> : logs.map(log => (
                                    <div key={log.id} className="border-b pb-2">
                                        <p className="font-semibold text-sm">{log.action}</p>
                                        <p className="text-xs text-gray-500">{log.details}</p>
                                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                                            <span>By: {log.performedBy || 'System'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="bg-white p-6 rounded-lg shadow animate-fadeIn">
                        <h2 className="text-xl font-bold mb-4">User Management</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full leading-normal">
                                <thead>
                                    <tr>
                                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id}>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-no-wrap">{user.name}</p></td>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-no-wrap">{user.email}</p></td>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${user.role === 'Admin' ? 'text-green-900' : 'text-gray-900'}`}>
                                                    <span aria-hidden className={`absolute inset-0 ${user.role === 'Admin' ? 'bg-green-200' : 'bg-gray-200'} opacity-50 rounded-full`}></span>
                                                    <span className="relative">{user.role}</span>
                                                </span>
                                            </td>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleUpdateRole(user.id, user.role)} className="text-blue-600 hover:text-blue-900">Edit Role</button>
                                                    <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'election' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-lg font-bold mb-4 text-gray-700">Add New Position</h3>
                            <form onSubmit={handleCreatePosition} className="space-y-4">
                                <input
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Position Title (e.g., President)"
                                    value={newPosition.title}
                                    onChange={e => setNewPosition({ ...newPosition, title: e.target.value })}
                                />
                                <textarea
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Description..."
                                    value={newPosition.description}
                                    onChange={e => setNewPosition({ ...newPosition, description: e.target.value })}
                                />
                                <button className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition">Create Position</button>
                            </form>
                        </div>
                        {/* Candidate Approval Section */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-lg font-bold mb-4 text-gray-700">Approve Candidates</h3>
                            {pendingCandidates.length === 0 ? (
                                <p className="text-gray-500 italic">No pending applications.</p>
                            ) : (
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="text-left text-xs font-semibold text-gray-600 uppercase border-b">
                                            <th className="py-2">Name</th>
                                            <th className="py-2">Position</th>
                                            <th className="py-2">Manifesto</th>
                                            <th className="py-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingCandidates.map(cand => (
                                            <tr key={cand.id} className="border-b text-sm">
                                                <td className="py-3">{cand.name}</td>
                                                <td className="py-3 font-medium text-blue-600">{cand.position}</td>
                                                <td className="py-3 text-gray-500 truncate max-w-xs">{cand.manifesto}</td>
                                                <td className="py-3">
                                                    <button
                                                        onClick={() => handleApproveCandidate(cand.id)}
                                                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-xs"
                                                    >
                                                        Approve
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="bg-white p-6 rounded-lg shadow-sm border animate-fadeIn">
                        <h3 className="text-lg font-bold mb-4 text-gray-700">System Broadcast</h3>
                        <form onSubmit={handleBroadcast} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Group</label>
                                <select
                                    value={targetGroup}
                                    onChange={(e) => setTargetGroup(e.target.value)}
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                >
                                    <option value="All">All Users</option>
                                    <option value="Voters">Voters Only</option>
                                    <option value="Candidates">Candidates Only</option>
                                </select>
                            </div>
                            <textarea
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Message to all users..."
                                value={broadcastMessage}
                                onChange={e => setBroadcastMessage(e.target.value)}
                            />
                            <button className="w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600 transition">Send Notification</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ title, value, color }: { title: string, value: string | number, color: string }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center justify-between">
        <div>
            <p className="text-gray-500 text-sm font-medium uppercase">{title}</p>
            <h4 className="text-2xl font-bold text-gray-800 mt-1">{value}</h4>
        </div>
        <div className={`h-10 w-10 rounded-full ${color} opacity-20`}></div>
    </div>
);
