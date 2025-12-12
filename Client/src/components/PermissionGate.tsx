import React from 'react';
import { usePermission } from '../hooks/usePermission';

interface PermissionGateProps {
    permission: string;
    children: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({ permission, children }) => {
    const hasPermission = usePermission(permission);
    if (!hasPermission) return null;
    return <>{children}</>;
};
