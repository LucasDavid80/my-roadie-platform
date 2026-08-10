import { RegisterForm } from '@/components/features/auth/RegisterForm';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService } from '@/services/user-service';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/services/user-service', () => ({
    userService: {
        signUp: vi.fn(),
    },
}));

describe('RegisterForm Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Casos Positivos', () => {
        it('deve renderizar todos os campos de formulário e opções de perfil', () => {
            render(<RegisterForm />);

            expect(screen.getByPlaceholderText('Nome Completo')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('E-mail')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Senha')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Confirmar Senha')).toBeInTheDocument();
            expect(screen.getByLabelText(/perfil de usuário/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /cadastrar/i })).toBeInTheDocument();
        });

        it('deve enviar o formulário com sucesso ao preencher dados válidos', async () => {
            vi.mocked(userService.signUp).mockResolvedValueOnce({ id: 'user-1' });

            render(<RegisterForm />);

            fireEvent.change(screen.getByPlaceholderText('Nome Completo'), { target: { value: 'Lucas Teste' } });
            fireEvent.change(screen.getByPlaceholderText('E-mail'), { target: { value: 'teste@myroadie.br' } });
            fireEvent.change(screen.getByLabelText(/perfil de usuário/i), { target: { value: 'ROADIE' } });
            fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: '123456' } });
            fireEvent.change(screen.getByPlaceholderText('Confirmar Senha'), { target: { value: '123456' } });

            const submitButton = screen.getByRole('button', { name: /cadastrar/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(userService.signUp).toHaveBeenCalledWith({
                    name: 'Lucas Teste',
                    email: 'teste@myroadie.br',
                    role: 'ROADIE',
                    password: '123456',
                    confirmPassword: '123456',
                });
                expect(mockPush).toHaveBeenCalledWith('/login');
            });
        });
    });

    describe('Casos Negativos', () => {
        it('deve exibir erro se as senhas digitadas forem diferentes', async () => {
            render(<RegisterForm />);

            fireEvent.change(screen.getByPlaceholderText('Nome Completo'), { target: { value: 'Lucas Teste' } });
            fireEvent.change(screen.getByPlaceholderText('E-mail'), { target: { value: 'teste@myroadie.br' } });
            fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: '123456' } });
            fireEvent.change(screen.getByPlaceholderText('Confirmar Senha'), { target: { value: '654321' } });

            const submitButton = screen.getByRole('button', { name: /cadastrar/i });
            fireEvent.click(submitButton);

            expect(await screen.findByText(/as senhas não coincidem/i)).toBeInTheDocument();
            expect(userService.signUp).not.toHaveBeenCalled();
        });

        it('deve exibir erros de validação ao submeter formulário com campos em branco', async () => {
            render(<RegisterForm />);

            const submitButton = screen.getByRole('button', { name: /cadastrar/i });
            fireEvent.click(submitButton);

            expect(await screen.findByText(/nome muito curto/i)).toBeInTheDocument();
            expect(await screen.findByText(/e-mail inválido/i)).toBeInTheDocument();
            expect(await screen.findByText(/a senha deve ter pelo menos 6 caracteres/i)).toBeInTheDocument();
            expect(userService.signUp).not.toHaveBeenCalled();
        });

        it('deve exibir mensagem de erro na UI se a chamada a userService.signUp falhar', async () => {
            vi.mocked(userService.signUp).mockRejectedValueOnce(new Error('E-mail já cadastrado'));

            render(<RegisterForm />);

            fireEvent.change(screen.getByPlaceholderText('Nome Completo'), { target: { value: 'Lucas Teste' } });
            fireEvent.change(screen.getByPlaceholderText('E-mail'), { target: { value: 'duplicado@myroadie.br' } });
            fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: '123456' } });
            fireEvent.change(screen.getByPlaceholderText('Confirmar Senha'), { target: { value: '123456' } });

            const submitButton = screen.getByRole('button', { name: /cadastrar/i });
            fireEvent.click(submitButton);

            const alertBox = await screen.findByRole('alert');
            expect(alertBox).toHaveTextContent('E-mail já cadastrado');
            expect(mockPush).not.toHaveBeenCalled();
        });
    });
});