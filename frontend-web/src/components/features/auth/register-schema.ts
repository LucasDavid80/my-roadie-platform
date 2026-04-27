import { z } from 'zod';

export const registerSchema = z.object({
    name: z.string().min(3, 'Nome muito curto'),
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;