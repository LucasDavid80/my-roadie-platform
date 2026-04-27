import { RegisterForm } from '@/components/features/auth/RegisterForm';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn() }),
}));

describe('RegisterForm Component', () => {
    it('deve exibir erro se as senhas digitadas forem diferentes', async () => {
        render(<RegisterForm />);

        // Preenche os campos
        fireEvent.change(screen.getByPlaceholderText(/nome completo/i), { target: { value: 'Lucas Teste' } });
        fireEvent.change(screen.getByPlaceholderText(/e-mail/i), { target: { value: 'teste@myroadie.br' } });
        fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: '123456' } });
        fireEvent.change(screen.getByPlaceholderText('Confirmar Senha'), { target: { value: '654321' } });

        const submitButton = screen.getByRole('button', { name: /cadastrar/i });
        fireEvent.click(submitButton);

        // O erro definido no refine() do Zod deve aparecer
        expect(await screen.findByText(/as senhas não coincidem/i)).toBeInTheDocument();
    });
});