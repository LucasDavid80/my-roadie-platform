import { describe, it, expect } from 'vitest';
import { registerSchema } from './register-schema';

describe('Register Schema Validation', () => {
    it('deve rejeitar se as senhas não coincidirem', () => {
        const result = registerSchema.safeParse({
            name: 'Lucas David',
            email: 'lucas@myroadie.br',
            password: 'password123',
            confirmPassword: 'password456', // Diferente
        });
        expect(result.success).toBe(false);
        // Verifica se o erro está exatamente no campo confirmPassword
        if (!result.success) {
            expect(result.error.issues[0].path).toContain('confirmPassword');
        }
    });

    it('deve aceitar dados válidos e senhas iguais', () => {
        const result = registerSchema.safeParse({
            name: 'Lucas David',
            email: 'lucas@myroadie.br',
            password: 'password123',
            confirmPassword: 'password123',
        });
        expect(result.success).toBe(true);
    });
});