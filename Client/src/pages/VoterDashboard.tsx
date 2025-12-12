
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useSignalR } from '../context/SignalRContext';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css'; // Globally imported in App.tsx

interface Position {
    id: number;
    title: string;
    description: string;
}

interface Candidate {
    id: number;
    name: string;
    manifesto: string;
    voteCount: number;
}

export const VoterDashboard: React.FC = () => {
    const [positions, setPositions] = useState<Position[]>([]);
    const [candidates, setCandidates] = useState<Record<number, Candidate[]>>({});
    const [votedPositions, setVotedPositions] = useState<Set<number>>(new Set());
    const { user } = useAuthStore();
    const { connection } = useSignalR();

    useEffect(() => {
        fetchDashboard();
    }, []);

    // Listen for personal notifications
    useEffect(() => {
        if (connection) {
            connection.on("ReceiveNotification", (message: string) => {
                toast.success(message);
            });
        }
    }, [connection]);

    const fetchDashboard = async () => {
        try {
            const res = await api.get('/voter/dashboard');
            setPositions(res.data.positions);
            setCandidates(res.data.candidates);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load dashboard");
        }
    };

    const handleVote = async (candidateId: number, positionId: number) => {
        try {
            await api.post('/voter/vote', { candidateId, positionId });
            toast.success("Vote Cast Successfully!");
            setVotedPositions(prev => {
                const newSet = new Set(prev);
                newSet.add(positionId);
                return newSet;
            });
        } catch (err: any) {
            toast.error(err.response?.data || "Vote failed");
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Welcome, {user?.email}</h1>
            <div className="grid gap-6">
                {positions.map(pos => (
                    <div key={pos.id} className="border p-4 rounded shadow">
                        <h2 className="text-xl font-bold">{pos.title}</h2>
                        <p className="text-gray-600 mb-4">{pos.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {candidates[pos.id]?.map(cand => (
                                <div key={cand.id} className="bg-gray-50 p-4 rounded border">
                                    <h3 className="font-bold">{cand.name}</h3>
                                    <p className="text-sm text-gray-500 mb-2">Votes: {cand.voteCount}</p>
                                    {votedPositions.has(pos.id) ? (
                                        <div className="text-center p-2 bg-green-100 text-green-700 rounded border border-green-200">
                                            Voted ✓
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleVote(cand.id, pos.id)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full transition-colors"
                                        >
                                            Vote
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            {/* ToastContainer is global in App.tsx */}
        </div>
    );
};

