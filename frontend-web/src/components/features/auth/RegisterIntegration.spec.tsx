import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterForm } from './RegisterForm';
import { supabase } from '@/lib/supabase';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';
import { Mock } from 'vitest';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}));

describe('Register Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Casos Positivos', () => {
        it('deve realizar cadastro com sucesso e redirecionar para a tela de login', async () => {
            vi.spyOn(supabase.auth, 'signUp').mockResolvedValueOnce({
                data: { user: { id: 'mock-supabase-id' } as any, session: null },
                error: null,
            });

            render(<RegisterForm />);

            fireEvent.change(screen.getByPlaceholderText('Nome Completo'), {
                target: { value: 'Lucas David' },
            });
            fireEvent.change(screen.getByPlaceholderText('E-mail'), {
                target: { value: 'lucas@myroadie.br' },
            });
            fireEvent.change(screen.getByPlaceholderText('Senha'), {
                target: { value: '123456' },
            });
            fireEvent.change(screen.getByPlaceholderText('Confirmar Senha'), {
                target: { value: '123456' },
            });

            fireEvent.click(screen.getByRole('button', { name: /cadastrar/i }));

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/login');
            });
        });

        it('deve cadastrar usuário com perfil ROADIE selecionado', async () => {
            const signUpSpy = vi.spyOn(supabase.auth, 'signUp').mockResolvedValueOnce({
                data: { user: { id: 'mock-supabase-id-roadie' } as any, session: null },
                error: null,
            });

            render(<RegisterForm />);

            fireEvent.change(screen.getByPlaceholderText('Nome Completo'), {
                target: { value: 'Roadie Tech' },
            });
            fireEvent.change(screen.getByPlaceholderText('E-mail'), {
                target: { value: 'roadie@myroadie.br' },
            });
            fireEvent.change(screen.getByLabelText(/perfil de usuário/i), {
                target: { value: 'ROADIE' },
            });
            fireEvent.change(screen.getByPlaceholderText('Senha'), {
                target: { value: '123456' },
            });
            fireEvent.change(screen.getByPlaceholderText('Confirmar Senha'), {
                target: { value: '123456' },
            });

            fireEvent.click(screen.getByRole('button', { name: /cadastrar/i }));

            await waitFor(() => {
                expect(signUpSpy).toHaveBeenCalledWith({
                    email: 'roadie@myroadie.br',
                    password: '123456',
                    options: {
                        data: {
                            name: 'Roadie Tech',
                            role: 'ROADIE',
                        },
                    },
                });
                expect(mockPush).toHaveBeenCalledWith('/login');
            });
        });
    });

    describe('Casos Negativos', () => {
        it('deve exibir erro na UI se o Supabase Auth retornar erro de e-mail em uso', async () => {
            vi.spyOn(supabase.auth, 'signUp').mockResolvedValueOnce({
                data: { user: null, session: null },
                error: { message: 'User already registered' } as any,
            });

            render(<RegisterForm />);

            fireEvent.change(screen.getByPlaceholderText('Nome Completo'), {
                target: { value: 'Lucas David' },
            });
            fireEvent.change(screen.getByPlaceholderText('E-mail'), {
                target: { value: 'existente@myroadie.br' },
            });
            fireEvent.change(screen.getByPlaceholderText('Senha'), {
                target: { value: '123456' },
            });
            fireEvent.change(screen.getByPlaceholderText('Confirmar Senha'), {
                target: { value: '123456' },
            });

            fireEvent.click(screen.getByRole('button', { name: /cadastrar/i }));

            const alertBox = await screen.findByRole('alert');
            expect(alertBox).toHaveTextContent('User already registered');
            expect(mockPush).not.toHaveBeenCalled();
        });

        it('deve exibir mensagem de erro da API do backend em caso de falha HTTP 400', async () => {
            vi.spyOn(supabase.auth, 'signUp').mockResolvedValueOnce({
                data: { user: { id: 'mock-supabase-id' } as any, session: null },
                error: null,
            });

            server.use(
                http.post('http://localhost:3001/users', () => {
                    return HttpResponse.json(
                        { message: 'E-mail já está cadastrado no sistema' },
                        { status: 400 }
                    );
                })
            );

            render(<RegisterForm />);

            fireEvent.change(screen.getByPlaceholderText('Nome Completo'), {
                target: { value: 'Lucas David' },
            });
            fireEvent.change(screen.getByPlaceholderText('E-mail'), {
                target: { value: 'duplicado@myroadie.br' },
            });
            fireEvent.change(screen.getByPlaceholderText('Senha'), {
                target: { value: '123456' },
            });
            fireEvent.change(screen.getByPlaceholderText('Confirmar Senha'), {
                target: { value: '123456' },
            });

            fireEvent.click(screen.getByRole('button', { name: /cadastrar/i }));

            const alertBox = await screen.findByRole('alert');
            expect(alertBox).toHaveTextContent('E-mail já está cadastrado no sistema');
            expect(mockPush).not.toHaveBeenCalled();
        });
    });
});