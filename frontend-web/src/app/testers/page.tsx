import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Smartphone, Apple, ShieldAlert, Sparkles, Download } from 'lucide-react';

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
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <Smartphone className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                  Instalação Direta
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black">Android (.APK)</h2>
                <p className="text-zinc-600 text-sm mt-1">
                  Compatível com qualquer smartphone Android (versão 8.0 ou superior).
                </p>
              </div>

              {/* Botão de Download */}
              <div className="pt-2">
                <a
                  href="/downloads/my-roadie-release.apk"
                  download="my-roadie-release.apk"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20 hover:scale-[1.01]"
                >
                  <Download className="w-5 h-5" />
                  <span>Baixar APK do My Roadie</span>
                </a>
                <p className="text-[11px] text-zinc-400 text-center mt-1.5">
                  Arquivo .apk de release oficial para testes
                </p>
              </div>

              {/* Instruções de Instalação e Fontes Desconhecidas */}
              <div className="pt-2 space-y-3">
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  Passo a passo de instalação:
                </h3>
                <ol className="space-y-2.5 text-xs text-zinc-600">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <span>Toque no botão acima para iniciar o download do arquivo <strong>.apk</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <span>
                      Abra o arquivo baixado. Se o sistema exibir um aviso de segurança, clique em <strong>Configurações</strong> e ative a opção <strong>&quot;Permitir desta fonte&quot;</strong> (ou <em>Fontes desconhecidas</em>).
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </span>
                    <span>Confirme a instalação e abra o aplicativo <strong>My Roadie</strong> para começar a testar.</span>
                  </li>
                </ol>

                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-[11px] text-zinc-500 leading-relaxed">
                  💡 <strong>Nota:</strong> O alerta de &quot;fonte desconhecida&quot; é um procedimento padrão do Android para aplicativos instalados fora da Google Play Store durante fases de teste fechado.
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400">
              <span>Formato: APK</span>
              <span>Versão: MVP 1.0.0</span>
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
