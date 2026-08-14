import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { api } from '@/services/api';
import { supabase } from '@/lib/supabase';

vi.mock('@/services/api', () => ({
    api: {
        post: vi.fn(),
        get: vi.fn(),
    },
}));

vi.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            signInWithPassword: vi.fn(),
            onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
            signOut: vi.fn().mockResolvedValue({ error: null }),
        },
    },
}));

describe('AuthContext extra branches', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('handles invalid stored user JSON gracefully (JSON.parse throws)', () => {
        localStorage.setItem('@MyRoadie:user', '{ invalid json');
        localStorage.setItem('@MyRoadie:token', 'token');

        const { result } = renderHook(() => useAuth(), { wrapper: ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider> });

        expect(result.current.isAuthenticated).toBe(false);
    });

    it('signIn fallback uses Supabase user when backend api fails without response', async () => {
        vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({ data: { user: { id: 'sup-1', email: 'a@b.com', app_metadata: {}, user_metadata: { name: 'Fallback' }, aud: '', created_at: '' } }, error: null });
        vi.mocked(api.post).mockRejectedValue(new Error('Network failure')); // no response field

        const { result } = renderHook(() => useAuth(), { wrapper: ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider> });

        await act(async () => {
            await result.current.signIn({ email: 'a@b.com', password: 'pwd' });
        });

        expect(result.current.isAuthenticated).toBe(true);
        expect(localStorage.getItem('@MyRoadie:user')).toContain('Fallback');
    });
});

