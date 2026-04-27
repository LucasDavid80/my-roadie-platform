// src/components/features/auth/login-schema.ts
import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'Senha muito curta'),
});

export type LoginFormData = z.infer<typeof loginSchema>;