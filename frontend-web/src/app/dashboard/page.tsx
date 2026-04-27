'use client';

import { StatCard } from '@/components/ui/StatCard';
import { Calendar, CheckCircle, Music, DollarSign, Plus } from 'lucide-react';

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            {/* Header do Dashboard */}
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-secondary">MyRoadie</h1>
                    <p className="text-slate-500">Gerencie seus eventos</p>
                </div>
                <div className="flex gap-4">
                    {/* Aqui depois colocaremos os botões de perfil/logout */}
                    <div className="w-10 h-10 bg-primary rounded-full" />
                </div>
            </header>

            {/* Grid de Stats com as cores do seu AppColors.dart */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Este Mês"
                    value="0"
                    icon={<Calendar className="text-card-blue" />}
                    colorClass="bg-card-blue"
                />
                <StatCard
                    title="Próximos"
                    value="0"
                    icon={<CheckCircle className="text-card-green" />}
                    colorClass="bg-card-green"
                />
                <StatCard
                    title="Shows/Mês"
                    value="0"
                    icon={<Music className="text-primary" />}
                    colorClass="bg-primary"
                />
                <StatCard
                    title="Cachê/Mês"
                    value="0.0"
                    icon={<DollarSign className="text-card-purple" />}
                    colorClass="bg-card-purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Lado Esquerdo: Calendário (Placeholder por enquanto) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-[32px] shadow-sm min-h-[400px]">
                    <h3 className="text-lg font-bold text-secondary mb-4">Abril 2026</h3>
                    <div className="border-2 border-dashed border-slate-100 h-full rounded-xl flex items-center justify-center text-slate-400">
                        [Espaço para o Calendário]
                    </div>
                </div>

                {/* Lado Direito: Próximos Compromissos */}
                <div className="bg-white p-6 rounded-[32px] shadow-sm">
                    <h3 className="text-lg font-bold text-secondary mb-4">Próximos Compromissos</h3>
                    <p className="text-slate-400 text-sm">Nenhum evento agendado.</p>
                </div>
            </div>

            {/* Botão Flutuante (Igual ao seu mobile) */}
            <button className="fixed bottom-8 right-8 bg-primary p-4 rounded-2xl shadow-lg text-white hover:scale-110 transition-transform">
                <Plus size={32} />
            </button>
        </div>
    );
}