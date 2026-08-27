'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode, useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

function useIsMounted() {
    return useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false
    );
}

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: ('MUSICIAN' | 'ROADIE' | 'ADMIN')[];
}

export function ProtectedRoute({ children, allowedRoles }: Readonly<ProtectedRouteProps>) {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const isMounted = useIsMounted();

    const userRole = user?.role;
    const hasRoleAccess = !allowedRoles || (userRole ? allowedRoles.includes(userRole) : false);

    useEffect(() => {
        if (!isMounted) return;

        if (!isAuthenticated) {
            router.replace('/login');
            return;
        }

        if (!hasRoleAccess) {
            router.replace('/dashboard');
        }
    }, [isMounted, isAuthenticated, hasRoleAccess, router]);

    if (!isMounted || !isAuthenticated) {
        return <div className="min-h-screen flex items-center justify-center">Redirecionando...</div>;
    }

    if (!hasRoleAccess) {
        return <div className="min-h-screen flex items-center justify-center">Acesso negado.</div>;
    }

    return <>{children}</>;
}
