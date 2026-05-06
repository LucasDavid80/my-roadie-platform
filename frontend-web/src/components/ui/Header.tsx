'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music, CalendarDays, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    const isDashboard = pathname === '/dashboard';
    const isProfile = pathname === '/dashboard/profile';
    const isAdmin = pathname.startsWith('/admin');

    return (
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                    <Music size={20} className="text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-secondary leading-tight">MyRoadie</h1>
                    <p className="text-xs text-slate-400">Gerencie seus eventos</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Link 
                    href="/dashboard" 
                    className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${isDashboard ? 'bg-blue-50 text-primary' : 'hover:bg-slate-100 text-slate-500'}`}
                >
                    <CalendarDays size={20} />
                </Link>
                <Link 
                    href="/dashboard/profile" 
                    className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${isProfile ? 'bg-blue-50 text-primary' : 'hover:bg-slate-100 text-slate-500'}`}
                >
                    <User size={20} />
                </Link>

                {user?.role === 'ADMIN' && (
                    <Link 
                        href="/admin/users" 
                        className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${isAdmin ? 'bg-blue-50 text-primary' : 'hover:bg-slate-100 text-slate-500'}`}
                        title="Administração"
                    >
                        <Shield size={20} />
                    </Link>
                )}

                <div className="w-px h-6 bg-slate-200" />
                <button 
                    onClick={signOut}
                    className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
}
