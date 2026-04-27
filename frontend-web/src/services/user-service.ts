import { api } from './api';
import { RegisterFormData } from '@/components/features/auth/register-schema';

export const userService = {
    signUp: async (data: RegisterFormData) => {
        // No NestJS a rota padrão de criação (POST /users) que você já testou
        const response = await api.post('/users', {
            name: data.name,
            email: data.email,
            password: data.password,
            role: 'MUSICIAN', // Valor padrão inicial, depois podemos por um seletor
        });
        return response.data;
    },
};