'use client';

import { LoginForm } from '@/components/features/auth/LoginForm';
import Image from 'next/image';

export default function LoginPage() {
    return (
        // Esse é o degradê que configuramos no globals.css (primary-gradient)
        <main className="min-h-screen w-full bg-primary-gradient flex flex-col items-center justify-center p-4">

            {/* Container do Logo (Baseado no seu mobile) */}
            <div className="flex flex-col items-center mb-8">
                <div className="w-32 h-32 bg-white rounded-[20px] shadow-2xl flex items-center justify-center p-4">
                    {/* Certifique-se de ter a logo em public/assets/logo.png */}
                    <img
                        src="/assets/logo.png"
                        alt="MyRoadie Logo"
                        className="w-full h-full object-contain"
                    />
                </div>
                <h1 className="text-4xl font-bold text-secondary mt-4 tracking-wider">
                    MyRoadie
                </h1>
            </div>

            {/* O "Card" que no Flutter subia, aqui vamos deixar centralizado no Web */}
            <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-8 pt-10">
                <h2 className="text-2xl font-bold text-secondary text-center mb-8">
                    Bem-vindo de volta!
                </h2>

                {/* CHAMADA PARA O COMPONENTE QUE VOCÊ JÁ CRIOU */}
                <LoginForm />

                <div className="mt-8 text-center text-slate-600">
                    Ainda não tem conta?{' '}
                    <button className="text-primary font-bold hover:underline">
                        Cadastre-se
                    </button>
                </div>
            </div>
        </main>
    );
}