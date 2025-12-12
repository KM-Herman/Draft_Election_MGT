import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSignalR } from '../context/SignalRContext';

interface ChartData {
    id: number;
    name: string; // Candidate Name
    votes: number;
}

// Mock initial data or pass as props
const initialData: ChartData[] = [
    { id: 1, name: 'Candidate A', votes: 0 },
    { id: 2, name: 'Candidate B', votes: 0 },
];

export const LiveChart: React.FC = () => {
    const { connection } = useSignalR();
    const [data, setData] = useState<ChartData[]>(initialData);

    useEffect(() => {
        if (!connection) return;

        connection.on("ReceiveVoteUpdate", (candidateId: number, newCount: number) => {
            console.log(`Update: Candidate ${candidateId} -> ${newCount}`);

            setData(prevData => {
                return prevData.map(item => {
                    if (item.id === candidateId) {
                        return { ...item, votes: newCount };
                    }
                    return item;
                });
            });
        });

        return () => {
            connection.off("ReceiveVoteUpdate");
        };
    }, [connection]);

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="votes" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
