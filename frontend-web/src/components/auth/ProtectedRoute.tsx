'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode, useState } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: ('MUSICIAN' | 'ROADIE' | 'ADMIN')[];
}

export function ProtectedRoute({ children, allowedRoles }: Readonly<ProtectedRouteProps>) {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const rolesKey = allowedRoles?.join(',');

    useEffect(() => {
        if (!isMounted) return;

        if (!isAuthenticated) {
            router.replace('/login');
            return;
        }

        if (allowedRoles && user && !allowedRoles.includes(user.role)) {
            router.replace('/dashboard');
        }
    }, [isMounted, isAuthenticated, user?.role, rolesKey, router]);

    if (!isMounted || !isAuthenticated) {
        return <div className="min-h-screen flex items-center justify-center">Redirecionando...</div>;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <div className="min-h-screen flex items-center justify-center">Acesso negado.</div>;
    }

    return <>{children}</>;
}
