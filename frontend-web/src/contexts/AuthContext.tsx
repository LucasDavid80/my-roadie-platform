'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { UserEntity } from '@/types/user';
import { api } from '@/services/api';

interface SignInCredentials {
    email: string;
    password?: string;
}

interface AuthContextData {
    user: UserEntity | null;
    isAuthenticated: boolean;
    signIn: (credentials: SignInCredentials) => Promise<void>;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [user, setUser] = useState<UserEntity | null>(() => {
        if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('@MyRoadie:user');
            const storedToken = localStorage.getItem('@MyRoadie:token');
            if (storedUser && storedToken) {
                try {
                    return JSON.parse(storedUser);
                } catch {
                    return null;
                }
            }
        }
        return null;
    });
    const isAuthenticated = !!user;

    async function signIn({ email }: SignInCredentials) {
        try {
            const response = await api.post('/auth/login', { email });
            const { access_token, user: userData } = response.data;

            localStorage.setItem('@MyRoadie:token', access_token);
            localStorage.setItem('@MyRoadie:user', JSON.stringify(userData));

            setUser(userData);
        } catch (error) {
            console.error('Erro no login:', error);
            throw new Error('Falha na autenticação');
        }
    }

    function signOut() {
        localStorage.removeItem('@MyRoadie:token');
        localStorage.removeItem('@MyRoadie:user');
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);