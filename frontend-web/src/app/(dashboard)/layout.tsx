'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <WorkspaceProvider>{children}</WorkspaceProvider>
        </ProtectedRoute>
    );
}
