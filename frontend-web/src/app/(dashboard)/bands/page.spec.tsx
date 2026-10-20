import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BandsPage from './page';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { bandService } from '@/services/band-service';

vi.mock('@/contexts/WorkspaceContext', () => ({
    useWorkspace: vi.fn(),
}));

vi.mock('@/services/band-service', () => ({
    bandService: {
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
}));

vi.mock('@/components/ui/Header', () => ({
    Header: () => <div data-testid="header" />,
}));

describe('BandsPage', () => {
    const refreshBands = vi.fn().mockResolvedValue(undefined);
    const bands = [
        { id: 'band-1', name: 'Banda Um' },
        { id: 'band-2', name: 'Banda Dois' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useWorkspace).mockReturnValue({
            bands,
            activeBandId: 'band-1',
            activeBand: bands[0],
            isLoading: false,
            error: null,
            selectBand: vi.fn(),
            refreshBands,
        });
    });

    it('deve exibir estado vazio e erro do workspace', () => {
        vi.mocked(useWorkspace).mockReturnValue({
            bands: [],
            activeBandId: null,
            activeBand: null,
            isLoading: false,
            error: 'Não foi possível carregar suas bandas.',
            selectBand: vi.fn(),
            refreshBands,
        });

        render(<BandsPage />);

        expect(screen.getByText('Não foi possível carregar suas bandas.')).toBeInTheDocument();
        expect(screen.getByText('Nenhuma banda cadastrada')).toBeInTheDocument();
    });

    it('deve criar uma banda e atualizar a lista', async () => {
        vi.mocked(bandService.create).mockResolvedValue(bands[0]);
        render(<BandsPage />);

        fireEvent.click(screen.getByRole('button', { name: 'Nova banda' }));
        fireEvent.change(screen.getByLabelText('Nome da banda'), {
            target: { value: '  Banda Nova  ' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

        await waitFor(() => {
            expect(bandService.create).toHaveBeenCalledWith({ name: 'Banda Nova' });
            expect(refreshBands).toHaveBeenCalled();
        });
        expect(screen.queryByRole('heading', { name: 'Nova banda' })).not.toBeInTheDocument();
    });

    it('deve editar uma banda existente', async () => {
        vi.mocked(bandService.update).mockResolvedValue({ ...bands[0], name: 'Banda Editada' });
        render(<BandsPage />);

        fireEvent.click(screen.getByRole('button', { name: 'Editar Banda Um' }));
        fireEvent.change(screen.getByLabelText('Nome da banda'), {
            target: { value: 'Banda Editada' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

        await waitFor(() => {
            expect(bandService.update).toHaveBeenCalledWith('band-1', { name: 'Banda Editada' });
            expect(refreshBands).toHaveBeenCalled();
        });
    });

    it('deve excluir a banda após confirmação', async () => {
        vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));
        vi.mocked(bandService.delete).mockResolvedValue(undefined);
        render(<BandsPage />);

        fireEvent.click(screen.getByRole('button', { name: 'Excluir Banda Um' }));

        await waitFor(() => {
            expect(bandService.delete).toHaveBeenCalledWith('band-1');
            expect(refreshBands).toHaveBeenCalled();
        });
        vi.unstubAllGlobals();
    });

    it('deve validar nome vazio sem chamar a API', async () => {
        render(<BandsPage />);

        fireEvent.click(screen.getByRole('button', { name: 'Nova banda' }));
        fireEvent.change(screen.getByLabelText('Nome da banda'), {
            target: { value: '   ' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

        expect(screen.getAllByText('Informe o nome da banda.')).toHaveLength(2);
        expect(bandService.create).not.toHaveBeenCalled();
    });
});
