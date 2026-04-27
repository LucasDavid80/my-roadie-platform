import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from './LoginForm';
import { describe, it, expect, vi } from 'vitest';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}));

describe('Login Integration', () => {
    it('deve redirecionar para a dashboard ao fazer login com sucesso', async () => {
        render(<LoginForm />);

        fireEvent.change(screen.getByPlaceholderText('E-mail'), {
            target: { value: 'lucas@myroadie.br' }
        });
        fireEvent.change(screen.getByPlaceholderText('Senha'), {
            target: { value: '123456' }
        });

        fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

        // Verifica se o redirecionamento aconteceu (indicando que a API "respondeu")
        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/dashboard');
        });
    });
});