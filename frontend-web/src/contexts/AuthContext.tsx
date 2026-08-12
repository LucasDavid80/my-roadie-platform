'use client';

import { createContext, useContext, useState, ReactNode, useRef, useEffect, useCallback } from 'react';
import { UserEntity } from '@/types/user';
import { api } from '@/services/api';
import { supabase } from '@/lib/supabase';

interface SignInCredentials {
    email: string;
    password: string;
}

interface AuthContextData {
    user: UserEntity | null;
    isAuthenticated: boolean;
    signIn: (credentials: SignInCredentials) => Promise<void>;
    signOut: () => void;
    fetchProfile: () => Promise<UserEntity | null>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
    const isFetchingProfileRef = useRef(false);

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

    const fetchProfile = useCallback(async (): Promise<UserEntity | null> => {
        if (isFetchingProfileRef.current) {
            return null;
        }
        isFetchingProfileRef.current = true;
        try {
            if (typeof api.get === 'function') {
                const response = await api.get('/users/me');
                if (response?.data) {
                    const userData = response.data;
                    localStorage.setItem('@MyRoadie:user', JSON.stringify(userData));
                    setUser(userData);
                    return userData;
                }
            }
            return null;
        } catch (error) {
            console.error('Erro ao buscar perfil:', error);
            throw error;
        } finally {
            isFetchingProfileRef.current = false;
        }
    }, []);

    useEffect(() => {
        if (typeof supabase?.auth?.onAuthStateChange !== 'function') {
            return;
        }

        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
            if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
                try {
                    await fetchProfile();
                } catch (err) {
                    console.error('Erro ao buscar perfil via onAuthStateChange:', err);
                }
            } else if (event === 'SIGNED_OUT') {
                signOut();
            }
        });

        return () => {
            data?.subscription?.unsubscribe?.();
        };
    }, [fetchProfile]);

    async function signIn({ email, password }: SignInCredentials) {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('Erro na autenticação com Supabase:', error);
            throw new Error(error.message || 'Falha na autenticação');
        }

        try {
            const response = await api.post('/auth/login', { email });
            const { access_token, user: userData } = response.data;

            localStorage.setItem('@MyRoadie:token', access_token);
            if (userData) {
                localStorage.setItem('@MyRoadie:user', JSON.stringify(userData));
                setUser(userData);
            }

            await fetchProfile();
        } catch (error) {
            console.error('Erro no login:', error);
            throw new Error('Falha na autenticação');
        }
    }

    function signOut() {
        localStorage.removeItem('@MyRoadie:token');
        localStorage.removeItem('@MyRoadie:user');
        setUser(null);
        isFetchingProfileRef.current = false;
        if (typeof supabase?.auth?.signOut === 'function') {
            supabase.auth.signOut().catch(() => {});
        }
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, signIn, signOut, fetchProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);