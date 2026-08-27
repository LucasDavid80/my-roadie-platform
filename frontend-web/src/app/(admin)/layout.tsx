'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const ADMIN_ROLES: ('ADMIN')[] = ['ADMIN'];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            {children}
        </ProtectedRoute>
    );
}
