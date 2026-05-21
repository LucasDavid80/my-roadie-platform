import Image from 'next/image';
import Link from 'next/link';
import { Music, Truck, DollarSign, Calendar } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header/Navbar Simplificada */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <Image src="/assets/logo.svg" alt="My Roadie Logo" width={40} height={40} className="w-10 h-10" />
          <span className="text-xl font-bold text-black tracking-tight">MY ROADIE</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-black transition-colors">
            Entrar
          </Link>
          <Link 
            href="/register" 
            className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-dark transition-all shadow-sm"
          >
            Começar Agora
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative py-24 px-6 md:px-12 text-center bg-gradient-to-br from-white via-amber-50 to-orange-100">
          <div className="max-w-4xl mx-auto space-y-8 relative z-10">
            <h1 className="text-5xl md:text-7xl font-black text-black leading-tight tracking-tighter">
              A PLATAFORMA DEFINITIVA PARA QUEM <span className="text-primary">VIVE DE MÚSICA</span>.
            </h1>
            <p className="text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed">
              Centralize sua agenda, logística de palco e finanças em um só lugar. Feito por quem entende a estrada, para quem domina o palco.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link 
                href="/register" 
                className="w-full sm:w-auto px-8 py-4 bg-black text-white text-lg font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-lg hover:scale-[1.02]"
              >
                Sou Músico
              </Link>
              <Link 
                href="/register" 
                className="w-full sm:w-auto px-8 py-4 bg-primary text-white text-lg font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg hover:scale-[1.02]"
              >
                Sou Roadie
              </Link>
            </div>
          </div>
          
          {/* Faixa decorativa na parte inferior do hero */}
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-zinc-50 to-transparent"></div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 md:px-12 bg-zinc-50">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard 
                icon={<Calendar className="text-primary w-8 h-8" />}
                title="Agenda Centralizada"
                description="Shows, ensaios e viagens em um calendário compartilhado com toda a equipe."
              />
              <FeatureCard 
                icon={<Truck className="text-primary w-8 h-8" />}
                title="Logística de Palco"
                description="Checklists personalizados para cada show. Nunca mais esqueça um cabo ou pedal."
              />
              <FeatureCard 
                icon={<DollarSign className="text-primary w-8 h-8" />}
                title="Gestão Financeira"
                description="Controle de cachês, despesas e lucros por evento de forma transparente."
              />
              <FeatureCard 
                icon={<Music className="text-primary w-8 h-8" />}
                title="Repertório"
                description="Organize setlists e anotações técnicas para cada música do seu show."
              />
            </div>
          </div>
        </section>

        {/* Social Proof/Call to Action */}
        <section className="py-24 px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-black">Pronto para profissionalizar sua estrada?</h2>
            <p className="text-lg text-zinc-600">Junte-se a centenas de músicos e técnicos que já organizam suas carreiras com o My Roadie.</p>
            <Link 
              href="/register" 
              className="inline-block px-10 py-4 bg-black text-white font-bold rounded-xl hover:bg-zinc-800 transition-all mt-4"
            >
              Criar minha conta gratuita
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-zinc-100 text-center text-zinc-400 text-sm">
        <p>&copy; 2026 My Roadie Platform. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow space-y-4">
      <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-black">{title}</h3>
      <p className="text-zinc-500 leading-relaxed">{description}</p>
    </div>
  );
}
