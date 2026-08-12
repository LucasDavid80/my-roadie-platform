'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { loginSchema, LoginFormData } from './login-schema';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';

export function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const router = useRouter();
    const { signIn } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setAuthError(null);
        try {
            await signIn({ email: data.email, password: data.password });
            router.push('/dashboard');
        } catch (err: unknown) {
            let message = 'Falha na autenticação';
            if (err instanceof Error) {
                message = err.message;
            } else if (typeof err === 'string') {
                message = err;
            }

            const lower = message.toLowerCase();
            if (
                lower.includes('invalid') ||
                lower.includes('credentials') ||
                lower.includes('not found') ||
                lower.includes('e-mail ou senha incorretos') ||
                lower.includes('falha na autenticação')
            ) {
                setAuthError('E-mail ou senha incorretos');
            } else if (lower.includes('token_expired') || lower.includes('expirou') || lower.includes('sessão expirada')) {
                setAuthError('Sessão expirada. Faça login novamente.');
            } else if (lower.includes('invalid_signature') || lower.includes('assinatura')) {
                setAuthError('Assinatura de token inválida. Faça login novamente.');
            } else if (lower.includes('malformed_token') || lower.includes('formato do token')) {
                setAuthError('Formato do token inválido.');
            } else if (lower.includes('missing_bearer') || lower.includes('cabeçalho')) {
                setAuthError('Cabeçalho de autorização ausente.');
            } else {
                setAuthError(message);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {authError && (
                <div role="alert" className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded-xl text-center">
                    {authError}
                </div>
            )}
            {/* CAMPO E-MAIL */}
            <div className="flex flex-col gap-1">
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all
          ${errors.email ? 'border-red-500' : 'border-input-border focus-within:border-primary'}`}>
                    <Mail className="text-slate-400 w-5 h-5" />
                    <input
                        {...register('email')}
                        type="email"
                        placeholder="E-mail"
                        className="flex-1 bg-transparent outline-none text-text-dark placeholder:text-slate-400"
                    />
                </div>
                {errors.email && <span className="text-xs text-red-500 ml-1">{errors.email.message}</span>}
            </div>

            {/* CAMPO SENHA */}
            <div className="flex flex-col gap-1">
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all
          ${errors.password ? 'border-red-500' : 'border-input-border focus-within:border-primary'}`}>
                    <Lock className="text-slate-400 w-5 h-5" />
                    <input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Senha"
                        className="flex-1 bg-transparent outline-none text-text-dark placeholder:text-slate-400"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                        className="text-slate-400 hover:text-primary transition-colors"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
                {errors.password && <span className="text-xs text-red-500 ml-1">{errors.password.message}</span>}
            </div>

            {/* BOTÃO ENTRAR */}
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12.5 bg-primary text-white font-bold rounded-xl shadow-md 
        hover:brightness-90 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
            >
                {isSubmitting ? 'CARREGANDO...' : 'ENTRAR'}
            </button>
        </form>
    );
}