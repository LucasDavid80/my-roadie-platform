import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from './LoginForm';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '@/contexts/AuthContext';

const mockPush = vi.fn();

// Mock do useRouter do Next.js
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}));

// Mock do useAuth
vi.mock('@/contexts/AuthContext', () => ({
    useAuth: vi.fn(),
}));

describe('LoginForm Component', () => {
    const mockSignIn = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
            signIn: mockSignIn,
        });
    });

    describe('Casos Positivos', () => {
        it('1. deve renderizar campos de e-mail e senha prontos para preenchimento', () => {
            render(<LoginForm />);

            expect(screen.getByPlaceholderText('E-mail')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Senha')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
        });

        it('2. deve alternar a visibilidade da senha ao clicar no botão de olho', () => {
            render(<LoginForm />);

            const passwordInput = screen.getByPlaceholderText('Senha');
            const toggleButton = screen.getByLabelText(/mostrar senha/i);

            expect(passwordInput).toHaveAttribute('type', 'password');

            fireEvent.click(toggleButton);
            expect(passwordInput).toHaveAttribute('type', 'text');

            const hideButton = screen.getByLabelText(/esconder senha/i);
            fireEvent.click(hideButton);
            expect(passwordInput).toHaveAttribute('type', 'password');
        });

        it('3. deve chamar signIn e redirecionar para /dashboard ao submeter dados válidos', async () => {
            mockSignIn.mockResolvedValue(undefined);

            render(<LoginForm />);

            fireEvent.change(screen.getByPlaceholderText('E-mail'), {
                target: { value: 'user@test.com' },
            });
            fireEvent.change(screen.getByPlaceholderText('Senha'), {
                target: { value: 'senha123' },
            });

            fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

            await waitFor(() => {
                expect(mockSignIn).toHaveBeenCalledWith({
                    email: 'user@test.com',
                    password: 'senha123',
                });
                expect(mockPush).toHaveBeenCalledWith('/dashboard');
            });
        });
    });

    describe('Casos Negativos', () => {
        it('1. deve exibir mensagens de erro de validação se os campos estiverem vazios ao submeter', async () => {
            render(<LoginForm />);

            const submitButton = screen.getByRole('button', { name: /entrar/i });
            fireEvent.click(submitButton);

            expect(await screen.findByText(/e-mail inválido/i)).toBeInTheDocument();
        });

        it('2. deve exibir banner "E-mail ou senha incorretos" ao falhar a autenticação no signIn', async () => {
            mockSignIn.mockRejectedValue(new Error('Invalid login credentials'));

            render(<LoginForm />);

            fireEvent.change(screen.getByPlaceholderText('E-mail'), {
                target: { value: 'errado@test.com' },
            });
            fireEvent.change(screen.getByPlaceholderText('Senha'), {
                target: { value: 'senha123' },
            });

            fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

            expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha incorretos');
        });

        it('3. deve exibir banner de "Sessão expirada. Faça login novamente." em resposta 401 TOKEN_EXPIRED', async () => {
            mockSignIn.mockRejectedValue(new Error('TOKEN_EXPIRED'));

            render(<LoginForm />);

            fireEvent.change(screen.getByPlaceholderText('E-mail'), {
                target: { value: 'expirado@test.com' },
            });
            fireEvent.change(screen.getByPlaceholderText('Senha'), {
                target: { value: 'senha123' },
            });

            fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

            expect(await screen.findByRole('alert')).toHaveTextContent('Sessão expirada. Faça login novamente.');
        });
    });
});