import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Mock } from 'vitest';
import { render, act, renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { api } from '@/services/api';
import { supabase } from '@/lib/supabase';
import { ReactNode } from 'react';

// Mock do axios/api
vi.mock('@/services/api', () => ({
    api: {
        post: vi.fn(),
        get: vi.fn(),
    },
}));

// Mock do cliente Supabase
vi.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            signInWithPassword: vi.fn(),
            onAuthStateChange: vi.fn(() => ({
                data: { subscription: { unsubscribe: vi.fn() } },
            })),
            signOut: vi.fn().mockResolvedValue({ error: null }),
        },
    },
}));

const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
);

function TestComponent() {
    const { user, signIn, signOut, isAuthenticated } = useAuth();
    return (
        <div>
            <div data-testid="user">{user?.name}</div>
            <div data-testid="auth">{isAuthenticated.toString()}</div>
            <button onClick={() => signIn({ email: 'test@test.com', password: 'password123' })}>Login</button>
            <button onClick={signOut}>Logout</button>
        </div>
    );
}

describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('deve iniciar não autenticado', () => {
        const { getByTestId } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(getByTestId('auth').textContent).toBe('false');
    });

    describe('Casos Positivos', () => {
        it('1. deve realizar login com credenciais válidas via Supabase Auth e armazenar token e perfil no localStorage', async () => {
            (supabase.auth.signInWithPassword as Mock).mockResolvedValue({
                data: { user: { id: 'supabase-123' } },
                error: null,
            });
            (api.post as Mock).mockResolvedValue({
                data: {
                    access_token: 'token-jwt-123',
                    user: { id: '1', name: 'Test User', email: 'test@test.com', role: 'MUSICIAN' },
                },
            });
            (api.get as Mock).mockResolvedValue({
                data: { id: '1', name: 'Test User', email: 'test@test.com', role: 'MUSICIAN' },
            });

            const { result } = renderHook(() => useAuth(), { wrapper });

            await act(async () => {
                await result.current.signIn({ email: 'test@test.com', password: 'password123' });
            });

            expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
                email: 'test@test.com',
                password: 'password123',
            });
            expect(localStorage.getItem('@MyRoadie:token')).toBe('token-jwt-123');
            expect(localStorage.getItem('@MyRoadie:user')).toContain('Test User');
        });

        it('2. deve definir o estado user e marcar isAuthenticated = true com credenciais válidas', async () => {
            (supabase.auth.signInWithPassword as Mock).mockResolvedValue({
                data: { user: { id: 'supabase-123' } },
                error: null,
            });
            (api.post as Mock).mockResolvedValue({
                data: {
                    access_token: 'token-jwt-123',
                    user: { id: '1', name: 'Musico Silva', email: 'musico@test.com', role: 'MUSICIAN' },
                },
            });
            (api.get as Mock).mockResolvedValue({
                data: { id: '1', name: 'Musico Silva', email: 'musico@test.com', role: 'MUSICIAN' },
            });

            const { getByTestId, getByText } = render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await act(async () => {
                getByText('Login').click();
            });

            expect(getByTestId('auth').textContent).toBe('true');
            expect(getByTestId('user').textContent).toBe('Musico Silva');
        });

        it('3. deve resolver a chamada de signIn permitindo avanço de fluxo após login validado', async () => {
            (supabase.auth.signInWithPassword as Mock).mockResolvedValue({
                data: { user: { id: 'supabase-123' } },
                error: null,
            });
            (api.post as Mock).mockResolvedValue({
                data: {
                    access_token: 'token-jwt-456',
                    user: { id: '2', name: 'Roadie Santos', email: 'roadie@test.com', role: 'ROADIE' },
                },
            });
            (api.get as Mock).mockResolvedValue({
                data: { id: '2', name: 'Roadie Santos', email: 'roadie@test.com', role: 'ROADIE' },
            });

            const { result } = renderHook(() => useAuth(), { wrapper });

            await act(async () => {
                await expect(
                    result.current.signIn({ email: 'roadie@test.com', password: 'password123' })
                ).resolves.toBeUndefined();
            });
        });

        it('4. deve garantir que fetchProfile seja disparado exatamente 1 vez por ciclo mesmo com chamadas simultâneas (deduplicação)', async () => {
            (api.get as Mock).mockResolvedValue({
                data: { id: '1', name: 'Perfil Único', email: 'perfil@test.com', role: 'MUSICIAN' },
            });

            const { result } = renderHook(() => useAuth(), { wrapper });

            let profile1;
            let profile2;

            await act(async () => {
                const res = await Promise.all([
                    result.current.fetchProfile(),
                    result.current.fetchProfile(),
                ]);
                profile1 = res[0];
                profile2 = res[1];
            });

            expect(api.get).toHaveBeenCalledTimes(1);
            expect(api.get).toHaveBeenCalledWith('/users/me');
            expect(profile1).toEqual({ id: '1', name: 'Perfil Único', email: 'perfil@test.com', role: 'MUSICIAN' });
            expect(profile2).toBeNull();
        });
    });

    describe('Casos Negativos', () => {
        it('1. deve lançar erro e não autenticar em caso de senha incorreta no Supabase Auth', async () => {
            (supabase.auth.signInWithPassword as Mock).mockResolvedValue({
                data: null,
                error: { message: 'Invalid login credentials' },
            });

            const { result } = renderHook(() => useAuth(), { wrapper });

            await expect(
                result.current.signIn({ email: 'test@test.com', password: 'wrongpassword' })
            ).rejects.toThrow('Invalid login credentials');

            expect(result.current.isAuthenticated).toBe(false);
            expect(localStorage.getItem('@MyRoadie:token')).toBeNull();
            expect(api.post).not.toHaveBeenCalled();
        });

        it('2. deve lançar erro e não autenticar em caso de usuário não encontrado', async () => {
            (supabase.auth.signInWithPassword as Mock).mockResolvedValue({
                data: null,
                error: { message: 'User not found' },
            });

            const { result } = renderHook(() => useAuth(), { wrapper });

            await expect(
                result.current.signIn({ email: 'naoexistente@test.com', password: 'password123' })
            ).rejects.toThrow('User not found');

            expect(result.current.isAuthenticated).toBe(false);
            expect(localStorage.getItem('@MyRoadie:token')).toBeNull();
            expect(api.post).not.toHaveBeenCalled();
        });

        it('3. deve tratar falhas de conexão/rede no Supabase Auth sem quebrar o estado do contexto', async () => {
            (supabase.auth.signInWithPassword as Mock).mockResolvedValue({
                data: null,
                error: { message: 'Network error connecting to Supabase Auth' },
            });

            const { result } = renderHook(() => useAuth(), { wrapper });

            await expect(
                result.current.signIn({ email: 'test@test.com', password: 'password123' })
            ).rejects.toThrow('Network error connecting to Supabase Auth');

            expect(result.current.isAuthenticated).toBe(false);
            expect(localStorage.getItem('@MyRoadie:token')).toBeNull();
            expect(api.post).not.toHaveBeenCalled();
        });

        it('4. deve deslogar e lançar erro de sessão expirada quando fetchProfile retornar 401 TOKEN_EXPIRED', async () => {
            const error401 = {
                response: {
                    status: 401,
                    data: { code: 'TOKEN_EXPIRED', message: 'O token de autenticação expirou. Faça login novamente.' },
                },
            };
            (api.get as Mock).mockRejectedValue(error401);

            const { result } = renderHook(() => useAuth(), { wrapper });

            await act(async () => {
                await expect(result.current.fetchProfile()).rejects.toThrow('Sessão expirada. Faça login novamente.');
            });

            expect(result.current.isAuthenticated).toBe(false);
        });
    });

    it('deve realizar logout e limpar o localStorage', async () => {
        localStorage.setItem('@MyRoadie:user', JSON.stringify({ id: '1', name: 'User' }));
        localStorage.setItem('@MyRoadie:token', 'token');

        const { getByTestId, getByText } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await act(async () => {
            getByText('Logout').click();
        });

        expect(getByTestId('auth').textContent).toBe('false');
        expect(localStorage.getItem('@MyRoadie:token')).toBeNull();
    });
});
