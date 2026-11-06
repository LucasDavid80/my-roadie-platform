import { api } from './api';
import { BandEntity, CreateBandData, UpdateBandData } from '@/types/band';

export const bandService = {
    getAll: async () => {
        const response = await api.get<BandEntity[]>('/bands');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<BandEntity>(`/bands/${id}`);
        return response.data;
    },

    create: async (data: CreateBandData) => {
        const response = await api.post<BandEntity>('/bands', data);
        return response.data;
    },

    update: async (id: string, data: UpdateBandData) => {
        const response = await api.patch<BandEntity>(`/bands/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/bands/${id}`);
    },
};
