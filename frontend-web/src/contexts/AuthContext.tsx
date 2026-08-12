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
        } catch (error: any) {
            console.error('Erro ao buscar perfil:', error);
            if (error?.response?.status === 401) {
                signOut();
                const code = error?.response?.data?.code;
                const msg = error?.response?.data?.message || error?.message;
                if (code === 'TOKEN_EXPIRED' || (typeof msg === 'string' && msg.includes('expirou'))) {
                    throw new Error('Sessão expirada. Faça login novamente.');
                }
                throw new Error(msg || 'Não autorizado');
            }
            if (!error?.response) {
                console.warn('Backend indisponível durante fetchProfile (erro de rede):', error?.message);
                return user;
            }
            throw error;
        } finally {
            isFetchingProfileRef.current = false;
        }
    }, [user]);

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
        const { data: supabaseAuthData, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('Erro na autenticação com Supabase:', error);
            throw new Error(error.message || 'Falha na autenticação');
        }

        try {
            if (typeof api.post === 'function') {
                const response = await api.post('/auth/login', { email });
                if (response?.data) {
                    const { access_token, user: userData } = response.data;
                    if (access_token) {
                        localStorage.setItem('@MyRoadie:token', access_token);
                    }
                    if (userData) {
                        localStorage.setItem('@MyRoadie:user', JSON.stringify(userData));
                        setUser(userData);
                    }
                }
            }

            await fetchProfile();
        } catch (error: any) {
            console.error('Erro no login:', error);
            if (error?.response?.status === 401) {
                const apiMsg = error?.response?.data?.message || error?.message;
                throw new Error(apiMsg || 'Falha na autenticação');
            }
            if (!error?.response && supabaseAuthData?.user) {
                const fallbackUser: UserEntity = {
                    id: supabaseAuthData.user.id,
                    email: supabaseAuthData.user.email || email,
                    name: (supabaseAuthData.user.user_metadata?.name as string) || email.split('@')[0],
                    role: 'MUSICIAN',
                };
                setUser(fallbackUser);
                localStorage.setItem('@MyRoadie:user', JSON.stringify(fallbackUser));
                return;
            }
            const apiMsg = error?.response?.data?.message || error?.message;
            throw new Error(apiMsg || 'Falha na autenticação');
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