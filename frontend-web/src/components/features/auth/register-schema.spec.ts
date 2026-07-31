import { describe, it, expect } from 'vitest';
import { registerSchema } from './register-schema';

describe('Register Schema Validation', () => {
    describe('Casos Positivos', () => {
        it('deve aceitar dados válidos e senhas iguais com papel MUSICIAN padrão', () => {
            const result = registerSchema.safeParse({
                name: 'Lucas David',
                email: 'lucas@myroadie.br',
                password: 'password123',
                confirmPassword: 'password123',
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.role).toBe('MUSICIAN');
            }
        });

        it('deve aceitar dados válidos com papel ROADIE especificado', () => {
            const result = registerSchema.safeParse({
                name: 'Roadie Silva',
                email: 'roadie@myroadie.br',
                password: 'password123',
                confirmPassword: 'password123',
                role: 'ROADIE',
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.role).toBe('ROADIE');
            }
        });
    });

    describe('Casos Negativos', () => {
        it('deve rejeitar se as senhas não coincidirem', () => {
            const result = registerSchema.safeParse({
                name: 'Lucas David',
                email: 'lucas@myroadie.br',
                password: 'password123',
                confirmPassword: 'password456',
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].path).toContain('confirmPassword');
                expect(result.error.issues[0].message).toBe('As senhas não coincidem');
            }
        });

        it('deve rejeitar se o e-mail for inválido', () => {
            const result = registerSchema.safeParse({
                name: 'Lucas David',
                email: 'email-invalido',
                password: 'password123',
                confirmPassword: 'password123',
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('E-mail inválido');
            }
        });

        it('deve rejeitar se o nome tiver menos de 3 caracteres', () => {
            const result = registerSchema.safeParse({
                name: 'Lu',
                email: 'lucas@myroadie.br',
                password: 'password123',
                confirmPassword: 'password123',
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Nome muito curto');
            }
        });

        it('deve rejeitar se a senha tiver menos de 6 caracteres', () => {
            const result = registerSchema.safeParse({
                name: 'Lucas David',
                email: 'lucas@myroadie.br',
                password: '123',
                confirmPassword: '123',
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('A senha deve ter pelo menos 6 caracteres');
            }
        });
    });
});