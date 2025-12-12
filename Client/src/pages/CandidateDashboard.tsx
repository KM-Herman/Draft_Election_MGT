import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

export const CandidateDashboard: React.FC = () => {
    const [stats, setStats] = useState({ rank: 0, votes: 0 });
    const [manifesto, setManifesto] = useState('');
    const [hasApplied, setHasApplied] = useState(false);

    useEffect(() => {
        fetchCandidateStats();
    }, []);

    const fetchCandidateStats = async () => {
        try {
            const res = await api.get('/candidate/stats');
            setStats(res.data);
            setHasApplied(true);
        } catch (err) {
            // Likely not a candidate yet
            setHasApplied(false);
        }
    };

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/candidate/apply', { positionId: 1, manifesto }); // Hardcoded Pos ID for demo
            toast.success("Application Submitted!");
            setHasApplied(true);
            fetchCandidateStats();
        } catch (err: any) {
            toast.error(err.response?.data || "Application Failed");
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Candidate Portal</h2>

            {!hasApplied ? (
                <div className="bg-white p-8 rounded-xl shadow-sm border">
                    <h3 className="text-xl font-bold mb-4">Apply for Candidacy</h3>
                    <p className="text-gray-600 mb-6">Join the race and make a difference. Submit your manifesto below.</p>
                    <form onSubmit={handleApply} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Manifesto / Vision</label>
                            <textarea
                                className="w-full h-32 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                                placeholder="I promise to..."
                                value={manifesto}
                                onChange={e => setManifesto(e.target.value)}
                                required
                            />
                        </div>
                        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                            Submit Application
                        </button>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-8 rounded-xl shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="opacity-80 font-medium">Current Standing</p>
                            <h3 className="text-4xl font-bold mt-2">Rank #{stats.rank}</h3>
                            <p className="mt-4 text-blue-100">You have received <span className="font-bold text-white">{stats.votes}</span> votes so far.</p>
                        </div>
                        {/* Decorative circle */}
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 bg-white opacity-10 rounded-full"></div>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-sm border">
                        <h3 className="text-lg font-bold mb-4">Campaign Status</h3>
                        <p className="text-green-600 font-medium flex items-center">
                            <span className="h-3 w-3 bg-green-500 rounded-full mr-2"></span>
                            Active & Running
                        </p>
                        <div className="mt-6">
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit Manifesto &rarr;</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
