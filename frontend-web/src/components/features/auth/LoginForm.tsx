'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { loginSchema, LoginFormData } from './login-schema';
import { useRouter } from 'next/navigation';

export function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        // Simulação do _doLogin() do Flutter
        console.log('Dados de login:', data);

        // Aqui você chamaria seu backend NestJS futuramente
        // await api.post('/auth/login', data);

        router.push('/dashboard');
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
                className="w-full h-[50px] bg-primary text-white font-bold rounded-xl shadow-md 
        hover:brightness-90 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
            >
                {isSubmitting ? 'CARREGANDO...' : 'ENTRAR'}
            </button>
        </form>
    );
}