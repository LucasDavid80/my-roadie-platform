import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RegisterForm } from './RegisterForm';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}));

describe('Register Integration', () => {
    it('deve redirecionar para a dashboard ao fazer login com sucesso', async () => {
        render(<RegisterForm />);

        fireEvent.change(screen.getByPlaceholderText('Nome Completo'), {
            target: { value: 'Lucas David' }
        });
        fireEvent.change(screen.getByPlaceholderText('E-mail'), {
            target: { value: 'lucas@myroadie.br' }
        });
        fireEvent.change(screen.getByPlaceholderText('Senha'), {
            target: { value: '123456' }
        });
        fireEvent.change(screen.getByPlaceholderText('Confirmar Senha'), {
            target: { value: '123456' }
        });

        fireEvent.click(screen.getByRole('button', { name: /cadastrar/i }));

        // Verifica se o redirecionamento aconteceu (indicando que a API "respondeu")
        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/login');
        });
    });
});