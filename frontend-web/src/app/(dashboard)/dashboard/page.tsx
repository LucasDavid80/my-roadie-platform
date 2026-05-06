'use client';

import { useState } from 'react';
import {
    Calendar,
    CheckCircle,
    Music,
    DollarSign,
    Plus,
    ChevronLeft,
    ChevronRight,
    CalendarDays,
} from 'lucide-react';
import { Header } from '@/components/ui/Header';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
}

interface CalendarEvent {
    date: number;
    title: string;
    color: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const WEEKDAYS = ['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.'];
const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

// ─── Componentes ─────────────────────────────────────────────────────────────

function StatCard({ title, value, icon, iconBg, iconColor }: StatCardProps) {
    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 border border-slate-100">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
                <span className={iconColor}>{icon}</span>
            </div>
            <div>
                <p className="text-slate-400 text-sm font-medium">{title}</p>
                <p className="text-secondary text-2xl font-bold leading-tight">{value}</p>
            </div>
        </div>
    );
}

// ─── Calendário ──────────────────────────────────────────────────────────────

function MonthCalendar({ events }: { events: CalendarEvent[] }) {
    const today = new Date();
    const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });

    const daysInMonth = getDaysInMonth(current.year, current.month);
    const firstDay = getFirstDayOfMonth(current.year, current.month);
    const prevMonthDays = getDaysInMonth(current.year, current.month - 1);

    const goToToday = () => setCurrent({ year: today.getFullYear(), month: today.getMonth() });
    const prevMonth = () => setCurrent(c => {
        const m = c.month === 0 ? 11 : c.month - 1;
        const y = c.month === 0 ? c.year - 1 : c.year;
        return { year: y, month: m };
    });
    const nextMonth = () => setCurrent(c => {
        const m = c.month === 11 ? 0 : c.month + 1;
        const y = c.month === 11 ? c.year + 1 : c.year;
        return { year: y, month: m };
    });

    const isToday = (day: number) =>
        day === today.getDate() &&
        current.month === today.getMonth() &&
        current.year === today.getFullYear();

    const hasEvent = (day: number) => events.find(e => e.date === day);

    // Montar grid: dias do mês anterior + dias do mês atual + dias do próximo
    const cells: { day: number; type: 'prev' | 'current' | 'next' }[] = [];
    for (let i = firstDay - 1; i >= 0; i--) {
        cells.push({ day: prevMonthDays - i, type: 'prev' });
    }
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push({ day: d, type: 'current' });
    }
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
        cells.push({ day: d, type: 'next' });
    }

    return (
        <div className="bg-white rounded-3xl shadow-sm p-6 border border-slate-100">
            {/* Header do calendário */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-secondary">
                    {MONTHS[current.month]} {current.year}
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={goToToday}
                        className="px-4 py-1.5 rounded-xl border border-slate-200 text-sm font-medium text-secondary hover:bg-slate-50 transition-colors"
                    >
                        Hoje
                    </button>
                    <button
                        onClick={prevMonth}
                        className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Dias da semana */}
            <div className="grid grid-cols-7 mb-2">
                {WEEKDAYS.map(d => (
                    <div key={d} className="text-center text-xs font-medium text-slate-400 py-2">
                        {d}
                    </div>
                ))}
            </div>

            {/* Grid de dias */}
            <div className="grid grid-cols-7 gap-y-1">
                {cells.map((cell, idx) => {
                    const event = cell.type === 'current' ? hasEvent(cell.day) : undefined;
                    const today_ = cell.type === 'current' && isToday(cell.day);

                    return (
                        <div key={idx} className="flex flex-col items-center py-1">
                            <div className={`
                                w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium cursor-pointer transition-all
                                ${today_ ? 'bg-primary text-white font-bold shadow-md shadow-primary/30' : ''}
                                ${cell.type !== 'current' ? 'text-slate-300' : !today_ ? 'text-secondary hover:bg-slate-100' : ''}
                            `}>
                                {cell.day}
                            </div>
                            {event && (
                                <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${event.color}`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Page principal ───────────────────────────────────────────────────────────

export default function DashboardPage() {
    // Eventos mockados — futuramente vêm da API
    const mockEvents: CalendarEvent[] = [
        { date: 10, title: 'Show Bar do João', color: 'bg-primary' },
        { date: 18, title: 'Ensaio geral', color: 'bg-card-blue' },
        { date: 25, title: 'Festival', color: 'bg-card-green' },
    ];

    const upcomingEvents = [
        { day: '10', month: 'Mai', title: 'Show Bar do João', local: 'Centro, SP', color: 'bg-primary/10 border-primary/20', dot: 'bg-primary' },
        { day: '18', month: 'Mai', title: 'Ensaio geral', local: 'Estúdio X', color: 'bg-blue-50 border-blue-100', dot: 'bg-card-blue' },
        { day: '25', month: 'Mai', title: 'Festival', local: 'Parque Municipal', color: 'bg-green-50 border-green-100', dot: 'bg-card-green' },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />

            <main className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Este Mês"
                        value="3"
                        icon={<Calendar size={22} />}
                        iconBg="bg-blue-100"
                        iconColor="text-card-blue"
                    />
                    <StatCard
                        title="Próximos"
                        value="3"
                        icon={<CheckCircle size={22} />}
                        iconBg="bg-green-100"
                        iconColor="text-card-green"
                    />
                    <StatCard
                        title="Shows/Mês"
                        value="3"
                        icon={<Music size={22} />}
                        iconBg="bg-orange-100"
                        iconColor="text-primary"
                    />
                    <StatCard
                        title="Cachê/Mês"
                        value="R$ 0"
                        icon={<DollarSign size={22} />}
                        iconBg="bg-purple-100"
                        iconColor="text-card-purple"
                    />
                </div>

                {/* Calendário + Próximos */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calendário — ocupa 2/3 */}
                    <div className="lg:col-span-2">
                        <MonthCalendar events={mockEvents} />
                    </div>

                    {/* Próximos Compromissos — ocupa 1/3 */}
                    <div className="bg-white rounded-3xl shadow-sm p-6 border border-slate-100">
                        <div className="flex items-center gap-2 mb-5">
                            <CalendarDays size={20} className="text-primary" />
                            <h3 className="text-base font-bold text-secondary">Próximos Compromissos</h3>
                        </div>

                        {upcomingEvents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-center">
                                <CalendarDays size={32} className="text-slate-200 mb-2" />
                                <p className="text-slate-400 text-sm">Nenhum evento agendado.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {upcomingEvents.map((e, i) => (
                                    <div key={i} className={`flex items-start gap-3 p-3 rounded-2xl border ${e.color}`}>
                                        <div className="text-center min-w-[36px]">
                                            <p className="text-xl font-bold text-secondary leading-none">{e.day}</p>
                                            <p className="text-xs text-slate-400 font-medium">{e.month}</p>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${e.dot}`} />
                                                <p className="text-sm font-semibold text-secondary truncate">{e.title}</p>
                                            </div>
                                            <p className="text-xs text-slate-400 truncate">{e.local}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* FAB — igual ao Flutter */}
            <button className="fixed bottom-8 right-8 bg-primary w-14 h-14 rounded-2xl shadow-lg shadow-primary/40 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-transform">
                <Plus size={28} />
            </button>
        </div>
    );
}
