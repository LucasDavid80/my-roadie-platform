import { describe, it, expect } from 'vitest';
import { loginSchema } from './login-schema';

describe('Login Schema Validation', () => {
    it('deve rejeitar e-mail inválido', () => {
        const result = loginSchema.safeParse({ email: 'email-errado', password: '123456' });
        expect(result.success).toBe(false);
    });

    it('deve rejeitar senha com menos de 6 caracteres', () => {
        const result = loginSchema.safeParse({ email: 'lucas@myroadie.br', password: '123' });
        expect(result.success).toBe(false);
    });

    it('deve aceitar dados válidos', () => {
        const result = loginSchema.safeParse({ email: 'lucas@myroadie.br', password: '123456' });
        expect(result.success).toBe(true);
    });
});