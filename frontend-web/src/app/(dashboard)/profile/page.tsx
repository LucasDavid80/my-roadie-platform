'use client';

import { useState, useEffect } from 'react';
import {
    User as UserIcon,
    Save,
    // Instagram, 
    // Youtube, 
    MapPin,
    Phone,
    Briefcase,
    DollarSign
} from 'lucide-react';
import { Header } from '@/components/ui/Header';
import { SelectionTag } from '@/components/ui/SelectionTag';
import { userService } from '@/services/user-service';
import { UserEntity } from '@/types/user';

const INSTRUMENTS = ['Violão', 'Guitarra', 'Baixo', 'Bateria', 'Teclado', 'Voz/Vocal'];
const STYLES = ['MPB', 'Rock', 'Jazz', 'Samba', 'Sertanejo'];

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<UserEntity | null>(null);

    useEffect(() => {
        async function loadUser() {
            try {
                // Mock ID para demonstração - em produção viria do AuthContext ou Supabase
                // Por enquanto, tentamos pegar o primeiro usuário ou usamos um mock
                const users = await userService.getAll();
                if (users.length > 0) {
                    setUser(users[0]);
                } else {
                    setUser({
                        id: '1',
                        name: 'Usuário Roadie',
                        email: 'contato@roadie.com',
                        role: 'MUSICIAN',
                        bio: '',
                        city: '',
                        federativeUnit: '',
                        phone: '',
                        instagram: '',
                        youtubeLink: '',
                        instruments: [],
                        styles: [],
                        isAvailable: true,
                        supabaseId: 'mock-sb-id',
                        minCache: 0
                    });
                }
            } catch (error) {
                console.error("Erro ao carregar perfil", error);
            } finally {
                setLoading(false);
            }
        }
        loadUser();
    }, []);

    const toggleSelection = (list: string[] | undefined, item: string) => {
        const currentList = list || [];
        const newList = currentList.includes(item)
            ? currentList.filter(i => i !== item)
            : [...currentList, item];

        setUser(u => u ? { ...u, [list === user?.instruments ? 'instruments' : 'styles']: newList } : null);
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await userService.update(user.id, user);
            alert('Perfil atualizado com sucesso!');
        } catch (error) {
            alert('Erro ao salvar perfil.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-slate-400 font-medium animate-pulse">Carregando perfil...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />

            <main className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">
                {/* Cabeçalho do Perfil */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-24 h-24 bg-blue-100 rounded-2xl flex items-center justify-center text-card-blue shadow-inner">
                        <UserIcon size={48} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl font-bold text-secondary">{user?.name || 'Sem Nome'}</h2>
                        <p className="text-slate-400 font-medium uppercase text-xs tracking-wider">
                            {user?.role === 'ROADIE' ? 'Roadie Profissional' : 'Músico'}
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3">
                            <span className="flex items-center gap-1.5 text-sm text-slate-500">
                                <MapPin size={16} className="text-primary" /> {user?.city || 'Cidade não informada'}
                            </span>
                            <span className="flex items-center gap-1.5 text-sm text-slate-500">
                                <Briefcase size={16} className="text-primary" /> {user?.instruments?.length ? user.instruments.join(', ') : 'Sem instrumentos'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        <Save size={20} />
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Coluna Principal */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Biografia */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                                <Briefcase size={20} className="text-primary" /> Sobre você
                            </h3>
                            <textarea
                                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-secondary focus:ring-2 focus:ring-primary/20 min-h-[150px] resize-none outline-none"
                                placeholder="Conte sua trajetória musical, experiências e especialidades..."
                                value={user?.bio || ''}
                                onChange={e => setUser(u => u ? { ...u, bio: e.target.value } : null)}
                            />
                        </div>

                        {/* Dados Pessoais */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-secondary mb-4">Dados Pessoais</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 ml-1">NOME COMPLETO</label>
                                    <input
                                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-secondary focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={user?.name || ''}
                                        onChange={e => setUser(u => u ? { ...u, name: e.target.value } : null)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 ml-1">E-MAIL</label>
                                    <input
                                        className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-slate-400 cursor-not-allowed"
                                        value={user?.email || ''}
                                        disabled
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 ml-1">TELEFONE</label>
                                    <div className="relative">
                                        <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            className="w-full bg-slate-50 border-none rounded-xl pl-11 pr-4 py-3 text-secondary focus:ring-2 focus:ring-primary/20 outline-none"
                                            placeholder="(00) 00000-0000"
                                            value={user?.phone || ''}
                                            onChange={e => setUser(u => u ? { ...u, phone: e.target.value } : null)}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 ml-1">CIDADE</label>
                                        <input
                                            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-secondary focus:ring-2 focus:ring-primary/20 outline-none"
                                            value={user?.city || ''}
                                            onChange={e => setUser(u => u ? { ...u, city: e.target.value } : null)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 ml-1">UF</label>
                                        <input
                                            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-secondary focus:ring-2 focus:ring-primary/20 outline-none text-center"
                                            placeholder="SP"
                                            maxLength={2}
                                            value={user?.federativeUnit || ''}
                                            onChange={e => setUser(u => u ? { ...u, federativeUnit: e.target.value.toUpperCase() } : null)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Habilidades */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-secondary mb-4">Instrumentos</h3>
                                <div className="flex flex-wrap gap-2">
                                    {INSTRUMENTS.map(item => (
                                        <SelectionTag
                                            key={item}
                                            label={item}
                                            isSelected={user?.instruments?.includes(item) || false}
                                            onClick={() => toggleSelection(user?.instruments, item)}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-secondary mb-4">Estilos Musicais</h3>
                                <div className="flex flex-wrap gap-2">
                                    {STYLES.map(item => (
                                        <SelectionTag
                                            key={item}
                                            label={item}
                                            isSelected={user?.styles?.includes(item) || false}
                                            onClick={() => {
                                                const currentStyles = user?.styles || [];
                                                const newStyles = currentStyles.includes(item)
                                                    ? currentStyles.filter(i => i !== item)
                                                    : [...currentStyles, item];
                                                setUser(u => u ? { ...u, styles: newStyles } : null);
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Coluna Lateral */}
                    <div className="space-y-6">
                        {/* Redes Sociais */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-secondary mb-4">Presença Digital</h3>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 ml-1">INSTAGRAM</label>
                                    <div className="relative">
                                        {/* <Instagram size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500" /> */}
                                        <input
                                            className="w-full bg-slate-50 border-none rounded-xl pl-12 pr-4 py-3 text-secondary text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="@seu_perfil"
                                            value={user?.instagram || ''}
                                            onChange={e => setUser(u => u ? { ...u, instagram: e.target.value } : null)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 ml-1">YOUTUBE (LINK)</label>
                                    <div className="relative">
                                        {/* <Youtube size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" /> */}
                                        <input
                                            className="w-full bg-slate-50 border-none rounded-xl pl-12 pr-4 py-3 text-secondary text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="Link do seu canal"
                                            value={user?.youtubeLink || ''}
                                            onChange={e => setUser(u => u ? { ...u, youtubeLink: e.target.value } : null)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profissional */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-secondary mb-4">Financeiro</h3>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 ml-1">CACHÊ MÍNIMO (R$)</label>
                                <div className="relative">
                                    <DollarSign size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500" />
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border-none rounded-xl pl-12 pr-4 py-3 text-secondary outline-none focus:ring-2 focus:ring-primary/20"
                                        value={user?.minCache || 0}
                                        onChange={e => setUser(u => u ? { ...u, minCache: Number(e.target.value) } : null)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-secondary mb-2">Status Atual</h3>
                            <p className="text-xs text-slate-400 mb-6 font-medium">Fique visível para novas oportunidades</p>
                            <label className="relative inline-flex items-center cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={user?.isAvailable || false}
                                    onChange={e => setUser(u => u ? { ...u, isAvailable: e.target.checked } : null)}
                                />
                                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                                <span className="ml-4 text-sm font-bold text-secondary group-hover:text-primary transition-colors">
                                    {user?.isAvailable ? 'Disponível' : 'Ocupado'}
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
