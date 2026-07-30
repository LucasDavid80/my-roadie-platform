import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from './LoginForm';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '@/contexts/AuthContext';

// Mock do useRouter do Next.js
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn() }),
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

    it('deve exibir mensagens de erro se os campos estiverem vazios ao submeter', async () => {
        render(<LoginForm />);

        const submitButton = screen.getByRole('button', { name: /entrar/i });
        fireEvent.click(submitButton);

        expect(await screen.findByText(/e-mail inválido/i)).toBeInTheDocument();
    });

    it('deve mudar o tipo do input de senha ao clicar no ícone de olho', () => {
        render(<LoginForm />);

        const passwordInput = screen.getByPlaceholderText('Senha');
        const toggleButton = screen.getByLabelText(/mostrar senha/i);

        expect(passwordInput).toHaveAttribute('type', 'password');

        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'text');
    });

    it('deve exibir banner de erro ao falhar a autenticação no signIn', async () => {
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
});