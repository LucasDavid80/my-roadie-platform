'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: ('MUSICIAN' | 'ROADIE' | 'ADMIN')[];
}

export function ProtectedRoute({ children, allowedRoles }: Readonly<ProtectedRouteProps>) {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        if (allowedRoles && user && !allowedRoles.includes(user.role)) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, user, allowedRoles, router]);

    if (!isAuthenticated) {
        return <div className="min-h-screen flex items-center justify-center">Redirecionando...</div>;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <div className="min-h-screen flex items-center justify-center">Acesso negado.</div>;
    }

    return <>{children}</>;
}
