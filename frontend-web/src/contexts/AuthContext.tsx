'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { UserEntity } from '@/types/user';
import { api } from '@/services/api';

interface AuthContextData {
    user: UserEntity | null;
    isAuthenticated: boolean;
    signIn: (credentials: any) => Promise<void>;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserEntity | null>(null);
    const isAuthenticated = !!user;

    async function signIn({ email, password }: any) {
        // 1. Chamada para o seu NestJS
        // const response = await api.post('/auth/login', { email, password });

        // 2. Simulação de sucesso para agora
        const mockUser: UserEntity = {
            id: '1',
            name: 'Lucas',
            email: email,
            role: 'ROADIE',
            experience: '5 anos',
            isAvailable: true,
            instruments: [],
            styles: [],
            phone: '',
            instagram: '',
            city: '',
            federativeUnit: '',
            minCache: 0,
            youtubeLink: '',
            bio: ''
        };

        setUser(mockUser);
        // Aqui no futuro salvaríamos o token nos Cookies
    }

    function signOut() {
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);