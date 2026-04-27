import { ReactNode, cloneElement, ReactElement } from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    colorClass?: string; // Nova prop para a cor (ex: 'bg-card-blue')
}

export function StatCard({ title, value, icon, colorClass = 'bg-slate-50' }: StatCardProps) {
    return (
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-50 flex items-center gap-4 hover:shadow-md transition-all">
            {/* O container do ícone agora usa a cor que você mandar */}
            <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 text-slate-700`}>
                {/* Aqui garantimos que o ícone herde a cor do container ou uma cor específica */}
                {icon}
            </div>
            <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
                <h3 className="text-2xl font-bold text-secondary">{value}</h3>
            </div>
        </div>
    );
}