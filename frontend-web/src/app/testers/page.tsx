import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Smartphone, Apple, ShieldAlert, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Download MVP | My Roadie — Programa de Testes',
  description: 'Página de distribuição e instruções de instalação do app My Roadie para testadores convidados.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function TestersPage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      {/* Header simplificado sem links de navegação pública */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12 bg-white border-b border-zinc-100">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/assets/logo.svg" alt="My Roadie Logo" width={36} height={36} className="w-9 h-9" />
          <span className="text-lg font-bold text-black tracking-tight">MY ROADIE</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-50 text-primary text-xs font-semibold rounded-full border border-amber-200/60 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Beta Fechado (MVP)
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12">
        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <h1 className="text-3xl md:text-5xl font-black text-black tracking-tight">
            Área de Testadores
          </h1>
          <p className="text-zinc-600 text-base md:text-lg leading-relaxed">
            Bem-vindo ao programa de testes fechados do <strong>My Roadie</strong>. 
            Escolha sua plataforma abaixo para baixar e instalar o aplicativo no seu dispositivo.
          </p>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-left text-sm text-amber-900 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Esta é uma versão inicial de avaliação. Seu feedback é fundamental para identificarmos melhorias e correções antes do lançamento público.
            </p>
          </div>
        </div>

        {/* Cards de Plataforma */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card Android */}
          <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <Smartphone className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-black">Android (.APK)</h2>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Instalação direta para smartphones Android.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-zinc-100">
              <span className="text-xs text-zinc-400">Seção Android</span>
            </div>
          </div>

          {/* Card iOS */}
          <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-900">
                <Apple className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-black">iOS (.IPA)</h2>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Instalação via Sideload para iPhones.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-zinc-100">
              <span className="text-xs text-zinc-400">Seção iOS</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-zinc-200 bg-white text-center text-zinc-400 text-sm">
        <p>&copy; 2026 My Roadie Platform. Acesso exclusivo para testadores convidados.</p>
      </footer>
    </div>
  );
}
