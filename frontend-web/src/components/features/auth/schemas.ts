// src/components/features/auth/schemas.ts
import { z } from 'zod';

export const registerSchema = z.object({
    name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
    email: z.string().email('Insira um e-mail válido'),
    role: z.enum(['MUSICIAN', 'ROADIE', 'ADMIN'], {
        errorMap: () => ({ message: 'Selecione um cargo válido' }),
    }),
});

export type RegisterData = z.infer<typeof registerSchema>;