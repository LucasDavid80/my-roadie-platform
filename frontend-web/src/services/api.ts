// src/services/api.ts
import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:3001',
});

api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('@MyRoadie:token') : null;
    if (token) {
        if (typeof config.headers.set === 'function') {
            config.headers.set('Authorization', 'Bearer ' + token);
        } else {
            config.headers.Authorization = 'Bearer ' + token;
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const data = error.response.data;
            if (data?.message) {
                error.message = data.message;
            } else if (data?.code) {
                error.message = data.code;
            }
        }
        return Promise.reject(error);
    }
);
