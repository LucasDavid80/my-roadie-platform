import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from './LoginForm';
import { describe, it, expect, vi } from 'vitest';

// Mock do useRouter do Next.js
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn() }),
}));

describe('LoginForm Component', () => {
    it('deve exibir mensagens de erro se os campos estiverem vazios ao submeter', async () => {
        render(<LoginForm />);

        const submitButton = screen.getByRole('button', { name: /entrar/i });
        fireEvent.click(submitButton);

        // O Zod valida e o React Hook Form deve mostrar os erros
        expect(await screen.findByText(/e-mail inválido/i)).toBeInTheDocument();
    });

    it('deve mudar o tipo do input de senha ao clicar no ícone de olho', () => {
        render(<LoginForm />);

        const passwordInput = screen.getByPlaceholderText('Senha');
        // Busca pelo aria-label que acabamos de criar
        const toggleButton = screen.getByLabelText(/mostrar senha/i);

        expect(passwordInput).toHaveAttribute('type', 'password');

        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'text');
    });
});