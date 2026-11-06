import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bandService } from './band-service';
import { api } from './api';

vi.mock('./api', () => ({
    api: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}));

describe('bandService', () => {
    beforeEach(() => vi.clearAllMocks());

    it('deve executar os contratos de listagem, detalhe e CRUD sem campos gerados', async () => {
        const band = { id: 'band-1', name: 'Banda Um' };
        vi.mocked(api.get)
            .mockResolvedValueOnce({ data: [band] })
            .mockResolvedValueOnce({ data: band });
        vi.mocked(api.post).mockResolvedValueOnce({ data: band });
        vi.mocked(api.patch).mockResolvedValueOnce({ data: band });
        vi.mocked(api.delete).mockResolvedValueOnce({});

        await expect(bandService.getAll()).resolves.toEqual([band]);
        await expect(bandService.getById('band-1')).resolves.toEqual(band);
        await expect(bandService.create({ name: 'Banda Um' })).resolves.toEqual(band);
        await expect(bandService.update('band-1', { name: 'Banda Atualizada' })).resolves.toEqual(band);
        await expect(bandService.delete('band-1')).resolves.toBeUndefined();

        expect(api.get).toHaveBeenNthCalledWith(1, '/bands');
        expect(api.get).toHaveBeenNthCalledWith(2, '/bands/band-1');
        expect(api.post).toHaveBeenCalledWith('/bands', { name: 'Banda Um' });
        expect(api.patch).toHaveBeenCalledWith('/bands/band-1', { name: 'Banda Atualizada' });
        expect(api.delete).toHaveBeenCalledWith('/bands/band-1');
    });

    it('deve propagar erro da API no carregamento', async () => {
        const error = new Error('network');
        vi.mocked(api.get).mockRejectedValueOnce(error);

        await expect(bandService.getAll()).rejects.toBe(error);
    });
});
