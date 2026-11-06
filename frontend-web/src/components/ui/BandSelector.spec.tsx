import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BandSelector } from './BandSelector';
import { useWorkspace } from '@/contexts/WorkspaceContext';

vi.mock('@/contexts/WorkspaceContext', () => ({
    useWorkspace: vi.fn(),
}));

describe('BandSelector', () => {
    beforeEach(() => vi.clearAllMocks());

    it('deve exibir o estado de carregamento', () => {
        vi.mocked(useWorkspace).mockReturnValue({
            bands: [],
            activeBandId: null,
            activeBand: null,
            isLoading: true,
            error: null,
            selectBand: vi.fn(),
            refreshBands: vi.fn(),
        });

        render(<BandSelector />);

        expect(screen.getByText('Carregando bandas...')).toBeInTheDocument();
    });

    it('deve exibir lista vazia e erro de carregamento', () => {
        vi.mocked(useWorkspace).mockReturnValue({
            bands: [],
            activeBandId: null,
            activeBand: null,
            isLoading: false,
            error: 'Falha ao carregar',
            selectBand: vi.fn(),
            refreshBands: vi.fn(),
        });

        const { rerender } = render(<BandSelector />);
        expect(screen.getByText('Falha ao carregar')).toBeInTheDocument();

        vi.mocked(useWorkspace).mockReturnValue({
            bands: [],
            activeBandId: null,
            activeBand: null,
            isLoading: false,
            error: null,
            selectBand: vi.fn(),
            refreshBands: vi.fn(),
        });
        rerender(<BandSelector />);
        expect(screen.getByText('Nenhuma banda disponível')).toBeInTheDocument();
    });

    it('deve exibir e selecionar o workspace ativo', () => {
        const selectBand = vi.fn();
        vi.mocked(useWorkspace).mockReturnValue({
            bands: [
                { id: 'band-1', name: 'Banda Um' },
                { id: 'band-2', name: 'Banda Dois' },
            ],
            activeBandId: 'band-1',
            activeBand: { id: 'band-1', name: 'Banda Um' },
            isLoading: false,
            error: null,
            selectBand,
            refreshBands: vi.fn(),
        });

        render(<BandSelector />);
        const select = screen.getByRole('combobox');

        expect(select).toHaveValue('band-1');
        fireEvent.change(select, { target: { value: 'band-2' } });
        expect(selectBand).toHaveBeenCalledWith('band-2');
    });
});
