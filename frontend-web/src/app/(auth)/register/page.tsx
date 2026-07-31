'use client';

import { RegisterForm } from '@/components/features/auth/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
    return (
        <main className="min-h-screen w-full bg-primary-gradient flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-8 pt-10">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-secondary">Crie sua conta</h2>
                    <p className="text-slate-400">Junte-se ao MyRoadie hoje!</p>
                </div>

                <RegisterForm />

                <Link
                    href="/login"
                    className="block w-full mt-6 text-center text-sm text-slate-600 hover:text-primary transition-colors"
                >
                    Já tem uma conta? <span className="font-bold">Entre aqui</span>
                </Link>
            </div>
        </main>
    );
}