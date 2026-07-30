import { api } from './api';
import { RegisterFormData } from '@/components/features/auth/register-schema';
import { supabase } from '@/lib/supabase';
import { UserEntity } from '@/types/user';

export const userService = {
    signUp: async (data: RegisterFormData) => {
        const userRole = data.role || 'MUSICIAN';
        // 1. Registra no Supabase Auth (email + senha + metadata)
        const { data: authData, error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    name: data.name,
                    role: userRole,
                },
            },
        });

        if (error) throw new Error(error.message);
        if (!authData.user) throw new Error('Erro ao criar conta no Supabase');

        // 2. Cria o perfil no backend NestJS com o supabaseId retornado
        const response = await api.post('/users', {
            name: data.name,
            email: data.email,
            supabaseId: authData.user.id, // ID gerado pelo Supabase
            role: userRole,
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
        // Clonamos os dados e removemos campos que o backend não permite no body
        const updateData = { ...data };
        delete updateData.id;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        const response = await api.patch<UserEntity>(`/users/${id}`, updateData);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/users/${id}`);
    },
};