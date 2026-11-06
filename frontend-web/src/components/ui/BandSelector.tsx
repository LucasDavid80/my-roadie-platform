'use client';

import { useWorkspace } from '@/contexts/WorkspaceContext';

export function BandSelector() {
    const { bands, activeBandId, isLoading, error, selectBand } = useWorkspace();

    if (isLoading) {
        return <span className="text-sm text-slate-400">Carregando bandas...</span>;
    }

    if (error) {
        return <span className="text-sm text-red-500">{error}</span>;
    }

    if (bands.length === 0) {
        return <span className="text-sm text-slate-400">Nenhuma banda disponível</span>;
    }

    return (
        <label className="flex items-center gap-2">
            <span className="sr-only">Banda ativa</span>
            <select
                value={activeBandId ?? ''}
                onChange={(event) => selectBand(event.target.value)}
                className="max-w-48 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-secondary outline-none focus:ring-2 focus:ring-primary/20"
            >
                {bands.map((band) => (
                    <option key={band.id} value={band.id}>
                        {band.name}
                    </option>
                ))}
            </select>
        </label>
    );
}
