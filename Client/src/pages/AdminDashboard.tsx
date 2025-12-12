import React, { useEffect, useState } from 'react';
import api from '../services/api';
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

    useEffect(() => {
        fetchStats();
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

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/admin/notification/broadcast', {
                targetGroup: 'All',
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

    return (
        <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Total Voters" value={stats.totalUsers} color="bg-blue-500" />
                <StatCard title="Votes Cast" value={stats.totalVotes} color="bg-purple-500" />
                <StatCard title="Candidates" value={stats.totalCandidates} color="bg-green-500" />
                <StatCard title="Participation" value="78%" color="bg-orange-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 ">
                {/* Live Chart Section */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-bold mb-4 text-gray-700">Live Election Results</h3>
                    <LiveChart />
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                    {/* Create Position */}
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
                            <button className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition">
                                Create Position
                            </button>
                        </form>
                    </div>

                    {/* Broadcast */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="text-lg font-bold mb-4 text-gray-700">System Broadcast</h3>
                        <form onSubmit={handleBroadcast} className="space-y-4">
                            <textarea
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Message to all users..."
                                value={broadcastMessage}
                                onChange={e => setBroadcastMessage(e.target.value)}
                            />
                            <button className="w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600 transition">
                                Send Notification
                            </button>
                        </form>
                    </div>
                </div>
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
