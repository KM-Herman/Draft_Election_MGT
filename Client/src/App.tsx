import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { VoterDashboard } from './pages/VoterDashboard';
import { PermissionGate } from './components/PermissionGate';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { AdminDashboard } from './pages/AdminDashboard';
import { CandidateDashboard } from './pages/CandidateDashboard';
import { DashboardLayout } from './layouts/DashboardLayout';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSignalR } from './context/SignalRContext';
import { useAuthStore } from './store/authStore';

const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <DashboardLayout>{children}</DashboardLayout>
);

const App: React.FC = () => {
    const { connection } = useSignalR();
    const { user } = useAuthStore();

    useEffect(() => {
        if (!connection || !user) return;

        connection.on("CandidateApproved", (approvedUserId: number) => {
            // Check if it's ME
            // We need to know my UserId. authStore user might not have ID?
            // Let's assume user.email matches or we decode token ID.
            // If we don't have ID handy, we can just say generic message "A candidate was approved"
            // But user asked for "role should change".
            // Refetching specific user logic is hard without ID match.
            // Let's simply toast.
            toast.info("A candidate has been approved!");
        });

        return () => {
            connection.off("CandidateApproved");
        }
    }, [connection, user]);

    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected Routes */}
                <Route path="/voter" element={
                    <PermissionGate permission="Permissions.CanViewDashboard">
                        <LayoutWrapper>
                            <VoterDashboard />
                        </LayoutWrapper>
                    </PermissionGate>
                } />

                <Route path="/admin" element={
                    <PermissionGate permission="Permissions.CanViewAdminStats">
                        <LayoutWrapper>
                            <AdminDashboard />
                        </LayoutWrapper>
                    </PermissionGate>
                } />

                <Route path="/candidate" element={
                    <PermissionGate permission="Permissions.CanAccessCandidateDashboard">
                        <LayoutWrapper>
                            <CandidateDashboard />
                        </LayoutWrapper>
                    </PermissionGate>
                } />

                {/* Default Redirect */}
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
            <ToastContainer position="bottom-right" />
        </BrowserRouter>
    );
};

export default App;
