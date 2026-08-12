import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from './LoginForm';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { api } from '@/services/api';
import { Mock } from 'vitest';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            signInWithPassword: vi.fn(),
        },
    },
}));

vi.mock('@/services/api', () => ({
    api: {
        post: vi.fn(),
        get: vi.fn(),
    },
}));

describe('Login Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('deve redirecionar para a dashboard ao fazer login com sucesso', async () => {
        (supabase.auth.signInWithPassword as Mock).mockResolvedValue({
            data: { user: { id: 'mock-supabase-id' } },
            error: null,
        });
        (api.post as Mock).mockResolvedValue({
            data: { access_token: 'mock-token', user: { id: '1', name: 'Lucas' } },
        });
        (api.get as Mock).mockResolvedValue({
            data: { id: '1', name: 'Lucas' },
        });

        render(
            <AuthProvider>
                <LoginForm />
            </AuthProvider>
        );

        fireEvent.change(screen.getByPlaceholderText('E-mail'), {
            target: { value: 'lucas@myroadie.br' },
        });
        fireEvent.change(screen.getByPlaceholderText('Senha'), {
            target: { value: '123456' },
        });

        fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/dashboard');
        });

        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
            email: 'lucas@myroadie.br',
            password: '123456',
        });
    });

    it('deve exibir mensagem de erro na UI e não redirecionar quando a senha for incorreta', async () => {
        (supabase.auth.signInWithPassword as Mock).mockResolvedValue({
            data: null,
            error: { message: 'Invalid login credentials' },
        });

        render(
            <AuthProvider>
                <LoginForm />
            </AuthProvider>
        );

        fireEvent.change(screen.getByPlaceholderText('E-mail'), {
            target: { value: 'lucas@myroadie.br' },
        });
        fireEvent.change(screen.getByPlaceholderText('Senha'), {
            target: { value: 'senhaerrada' },
        });

        fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha incorretos');
        expect(mockPush).not.toHaveBeenCalled();
    });
});