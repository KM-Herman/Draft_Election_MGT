import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignalRProvider } from './context/SignalRContext';
import { VoterDashboard } from './pages/VoterDashboard';
import { PermissionGate } from './components/PermissionGate';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { AdminDashboard } from './pages/AdminDashboard';
import { CandidateDashboard } from './pages/CandidateDashboard';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <DashboardLayout>{children}</DashboardLayout>
);

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <SignalRProvider>
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
            </SignalRProvider>
        </BrowserRouter>
    );
};

export default App;
