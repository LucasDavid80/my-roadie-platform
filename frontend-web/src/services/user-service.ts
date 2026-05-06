import { api } from './api';
import { RegisterFormData } from '@/components/features/auth/register-schema';
import { createClient } from '@supabase/supabase-js';
import { UserEntity } from '@/types/user';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const userService = {
    signUp: async (data: RegisterFormData) => {
        // 1. Registra no Supabase Auth (email + senha)
        const { data: authData, error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
        });

        if (error) throw new Error(error.message);
        if (!authData.user) throw new Error('Erro ao criar conta no Supabase');

        // 2. Cria o perfil no seu backend com o supabaseId retornado
        const response = await api.post('/users', {
            name: data.name,
            email: data.email,
            supabaseId: authData.user.id, // ID gerado pelo Supabase
            role: 'MUSICIAN',
        });

        return response.data;
    },

    create: async (data: Partial<UserEntity>) => {
        const response = await api.post<UserEntity>('/users', data);
        return response.data;
    },

    getAll: async () => {
        const response = await api.get<UserEntity[]>('/users');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<UserEntity>(`/users/${id}`);
        return response.data;
    },

    update: async (id: string, data: Partial<UserEntity>) => {
        const response = await api.patch<UserEntity>(`/users/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/users/${id}`);
    },
};