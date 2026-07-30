'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User, Briefcase } from 'lucide-react';
import { registerSchema, RegisterFormData } from './register-schema';
import { useRouter } from 'next/navigation';
import { userService } from '@/services/user-service';

export function RegisterForm() {
    const [authError, setAuthError] = useState<string | null>(null);
    const router = useRouter();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: 'MUSICIAN',
        },
    });

    const onSubmit = async (data: RegisterFormData) => {
        setAuthError(null);
        try {
            await userService.signUp(data);
            alert('Conta criada com sucesso! Agora faça seu login.');
            router.push('/login');
        } catch (error: unknown) {
            let message = 'Erro ao criar conta';
            if (error instanceof Error) {
                message = error.message;
            } else if (typeof error === 'object' && error !== null) {
                const err = error as Record<string, unknown>;
                const response = err.response as { data?: { message?: string } } | undefined;
                message = response?.data?.message ?? (err.message as string | undefined) ?? 'Erro ao criar conta';
            }
            setAuthError(message);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {authError && (
                <div role="alert" className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded-xl text-center">
                    {authError}
                </div>
            )}

            {/* NOME COMPLETO */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-primary transition-all">
                    <User className="text-primary w-5 h-5" />
                    <input
                        {...register('name')}
                        placeholder="Nome Completo"
                        className="flex-1 bg-transparent outline-none text-text-dark"
                    />
                </div>
                {errors.name && <span className="text-xs text-red-500 ml-1">{errors.name.message}</span>}
            </div>

            {/* E-MAIL */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-primary transition-all">
                    <Mail className="text-primary w-5 h-5" />
                    <input
                        {...register('email')}
                        placeholder="E-mail"
                        className="flex-1 bg-transparent outline-none text-text-dark"
                    />
                </div>
                {errors.email && <span className="text-xs text-red-500 ml-1">{errors.email.message}</span>}
            </div>

            {/* CARGO (ROLE) */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-primary transition-all">
                    <Briefcase className="text-primary w-5 h-5" />
                    <select
                        {...register('role')}
                        aria-label="Perfil de usuário"
                        className="flex-1 bg-transparent outline-none text-text-dark cursor-pointer"
                    >
                        <option value="MUSICIAN">Músico</option>
                        <option value="ROADIE">Roadie</option>
                    </select>
                </div>
                {errors.role && <span className="text-xs text-red-500 ml-1">{errors.role.message}</span>}
            </div>

            {/* SENHA */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-primary transition-all">
                    <Lock className="text-primary w-5 h-5" />
                    <input
                        {...register('password')}
                        type="password"
                        placeholder="Senha"
                        className="flex-1 bg-transparent outline-none text-text-dark"
                    />
                </div>
                {errors.password && <span className="text-xs text-red-500 ml-1">{errors.password.message}</span>}
            </div>

            {/* CONFIRMAR SENHA */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-primary transition-all">
                    <Lock className="text-primary w-5 h-5" />
                    <input
                        {...register('confirmPassword')}
                        type="password"
                        placeholder="Confirmar Senha"
                        className="flex-1 bg-transparent outline-none text-text-dark"
                    />
                </div>
                {errors.confirmPassword && <span className="text-xs text-red-500 ml-1">{errors.confirmPassword.message}</span>}
            </div>

            {/* BOTÃO CADASTRAR */}
            <button
                type="submit"
                className="w-full h-12.5 bg-secondary text-white font-bold rounded-xl shadow-md hover:brightness-110 active:scale-[0.98] transition-all mt-4"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'CADASTRANDO...' : 'CADASTRAR'}
            </button>
        </form>
    );
}