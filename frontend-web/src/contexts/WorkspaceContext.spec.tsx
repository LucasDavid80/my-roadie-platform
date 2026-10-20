import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkspaceProvider, useWorkspace } from './WorkspaceContext';
import { bandService } from '@/services/band-service';
import { useAuth } from './AuthContext';

vi.mock('@/services/band-service', () => ({
    bandService: {
        getAll: vi.fn(),
    },
}));

vi.mock('./AuthContext', () => ({
    useAuth: vi.fn(),
}));

const bands = [
    { id: 'band-1', name: 'Banda Um' },
    { id: 'band-2', name: 'Banda Dois' },
];

describe('WorkspaceContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        sessionStorage.clear();
        vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true } as ReturnType<typeof useAuth>);
        vi.mocked(bandService.getAll).mockResolvedValue(bands);
    });

    it('deve carregar bandas e selecionar a primeira quando não há workspace salvo', async () => {
        const { result } = renderHook(() => useWorkspace(), {
            wrapper: ({ children }) => <WorkspaceProvider>{children}</WorkspaceProvider>,
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.bands).toEqual(bands);
        expect(result.current.activeBandId).toBe('band-1');
        expect(result.current.activeBand).toEqual(bands[0]);
        expect(sessionStorage.getItem('@MyRoadie:activeBandId')).toBe('band-1');
    });

    it('deve restaurar o workspace salvo quando ele ainda estiver disponível', async () => {
        sessionStorage.setItem('@MyRoadie:activeBandId', 'band-2');

        const { result } = renderHook(() => useWorkspace(), {
            wrapper: ({ children }) => <WorkspaceProvider>{children}</WorkspaceProvider>,
        });

        await waitFor(() => expect(result.current.activeBandId).toBe('band-2'));

        expect(result.current.activeBand?.name).toBe('Banda Dois');
    });

    it('deve descartar workspace salvo que não pertence à lista acessível', async () => {
        sessionStorage.setItem('@MyRoadie:activeBandId', 'band-inacessivel');

        const { result } = renderHook(() => useWorkspace(), {
            wrapper: ({ children }) => <WorkspaceProvider>{children}</WorkspaceProvider>,
        });

        await waitFor(() => expect(result.current.activeBandId).toBe('band-1'));

        expect(sessionStorage.getItem('@MyRoadie:activeBandId')).toBe('band-1');
    });

    it('deve propagar a troca de workspace e persistir apenas uma banda válida', async () => {
        const { result } = renderHook(() => useWorkspace(), {
            wrapper: ({ children }) => <WorkspaceProvider>{children}</WorkspaceProvider>,
        });

        await waitFor(() => expect(result.current.activeBandId).toBe('band-1'));

        act(() => result.current.selectBand('band-2'));
        expect(result.current.activeBandId).toBe('band-2');
        expect(result.current.activeBand?.id).toBe('band-2');
        expect(sessionStorage.getItem('@MyRoadie:activeBandId')).toBe('band-2');

        act(() => result.current.selectBand('band-inacessivel'));
        expect(result.current.activeBandId).toBe('band-2');
        expect(sessionStorage.getItem('@MyRoadie:activeBandId')).toBe('band-2');
    });

    it('deve expor erro quando o carregamento das bandas falhar', async () => {
        vi.mocked(bandService.getAll).mockRejectedValueOnce(new Error('network'));

        const { result } = renderHook(() => useWorkspace(), {
            wrapper: ({ children }) => <WorkspaceProvider>{children}</WorkspaceProvider>,
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.error).toBe('Não foi possível carregar suas bandas.');
        expect(result.current.bands).toEqual([]);
    });
});
