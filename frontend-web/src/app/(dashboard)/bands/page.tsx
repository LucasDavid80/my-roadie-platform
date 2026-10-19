'use client';

import { useState } from 'react';
import { Edit2, Music2, Plus, Trash2, X } from 'lucide-react';
import { Header } from '@/components/ui/Header';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { bandService } from '@/services/band-service';
import { BandEntity } from '@/types/band';

function getErrorMessage(error: unknown, fallback: string) {
    const responseMessage = (
        error as { response?: { data?: { message?: string | string[] } } }
    ).response?.data?.message;

    if (Array.isArray(responseMessage)) {
        return responseMessage.join(', ');
    }

    return responseMessage || fallback;
}

export default function BandsPage() {
    const { bands, isLoading, error: loadError, refreshBands } = useWorkspace();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBand, setEditingBand] = useState<BandEntity | null>(null);
    const [name, setName] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingBandId, setDeletingBandId] = useState<string | null>(null);

    const openCreateModal = () => {
        setEditingBand(null);
        setName('');
        setFormError(null);
        setIsModalOpen(true);
    };

    const openEditModal = (band: BandEntity) => {
        setEditingBand(band);
        setName(band.name);
        setFormError(null);
        setIsModalOpen(true);
    };

    const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const normalizedName = name.trim();

        if (!normalizedName) {
            setFormError('Informe o nome da banda.');
            return;
        }

        setIsSaving(true);
        setFormError(null);

        try {
            if (editingBand) {
                await bandService.update(editingBand.id, { name: normalizedName });
            } else {
                await bandService.create({ name: normalizedName });
            }

            await refreshBands();
            setIsModalOpen(false);
        } catch (saveError) {
            setFormError(getErrorMessage(saveError, 'Não foi possível salvar a banda.'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (band: BandEntity) => {
        if (!window.confirm(`Deseja excluir a banda "${band.name}"?`)) {
            return;
        }

        setDeletingBandId(band.id);
        setFormError(null);

        try {
            await bandService.delete(band.id);
            await refreshBands();
        } catch (deleteError) {
            setFormError(getErrorMessage(deleteError, 'Não foi possível excluir a banda.'));
        } finally {
            setDeletingBandId(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />

            <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-8">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-primary">
                            <Music2 size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-secondary">Minhas bandas</h2>
                            <p className="text-sm text-slate-400">Crie e gerencie seus workspaces musicais.</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus size={20} />
                        Nova banda
                    </button>
                </div>

                {(loadError || formError) && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {loadError || formError}
                    </div>
                )}

                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                    {isLoading ? (
                        <p className="py-12 text-center text-slate-400">Carregando bandas...</p>
                    ) : bands.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Music2 size={36} className="mb-3 text-slate-200" />
                            <h3 className="font-bold text-secondary">Nenhuma banda cadastrada</h3>
                            <p className="mt-1 text-sm text-slate-400">
                                Crie sua primeira banda para começar a organizar o workspace.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {bands.map((band) => (
                                <div key={band.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                                    <div className="min-w-0">
                                        <p className="truncate font-bold text-secondary">{band.name}</p>
                                        <p className="text-xs text-slate-400">Workspace musical</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(band)}
                                            className="flex h-9 w-9 items-center justify-center rounded-xl text-blue-500 transition-colors hover:bg-blue-50"
                                            aria-label={`Editar ${band.name}`}
                                        >
                                            <Edit2 size={17} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(band)}
                                            disabled={deletingBandId === band.id}
                                            className="flex h-9 w-9 items-center justify-center rounded-xl text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                                            aria-label={`Excluir ${band.name}`}
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-secondary/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                            <h3 className="text-lg font-bold text-secondary">
                                {editingBand ? 'Editar banda' : 'Nova banda'}
                            </h3>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-secondary">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4 p-6">
                            <div className="space-y-1.5">
                                <label htmlFor="band-name" className="ml-1 text-xs font-bold uppercase text-slate-400">
                                    Nome da banda
                                </label>
                                <input
                                    id="band-name"
                                    required
                                    maxLength={100}
                                    autoFocus
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    className="w-full rounded-xl bg-slate-50 px-4 py-3 text-secondary outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            {formError && <p className="text-sm text-red-500">{formError}</p>}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 rounded-xl px-6 py-3 font-bold text-slate-500 transition-all hover:bg-slate-100"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 rounded-xl bg-primary px-6 py-3 font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                >
                                    {isSaving ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
