import { Test, TestingModule } from '@nestjs/testing';
import { RepertoireService } from './repertoire.service';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

describe('RepertoireService', () => {
  let service: RepertoireService;
  let prisma: PrismaService;

  const mockBand = {
    id: 'band-uuid-123',
    name: 'Banda Exemplo',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSong = {
    id: 'song-uuid-123',
    title: 'Música Exemplo',
    artist: 'Artista Exemplo',
    key: 'C#m',
    position: 1,
    notes: 'Intro no violão',
    bandId: 'band-uuid-123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepertoireService,
        {
          provide: PrismaService,
          useValue: {
            band: {
              findUnique: jest.fn().mockResolvedValue(mockBand),
            },
            repertoireSong: {
              create: jest.fn().mockResolvedValue(mockSong),
              findMany: jest.fn().mockResolvedValue([mockSong]),
              findUnique: jest.fn().mockResolvedValue(mockSong),
              update: jest.fn().mockResolvedValue(mockSong),
              delete: jest.fn().mockResolvedValue(mockSong),
            },
          },
        },
      ],
    }).compile();

    service = module.get<RepertoireService>(RepertoireService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar uma nova música no repertório quando a banda existir', async () => {
      const dto = {
        title: 'Música Exemplo',
        bandId: 'band-uuid-123',
        artist: 'Artista Exemplo',
        key: 'C#m',
        position: 1,
        notes: 'Intro no violão',
      };

      const result = await service.create(dto);

      expect(prisma.band.findUnique).toHaveBeenCalledWith({
        where: { id: dto.bandId },
      });
      expect(prisma.repertoireSong.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          bandId: dto.bandId,
          artist: dto.artist,
          key: dto.key,
          position: dto.position,
          notes: dto.notes,
        },
      });
      expect(result).toEqual(mockSong);
    });

    it('deve utilizar posição 0 como padrão ao criar música se position não for informado', async () => {
      const dto = {
        title: 'Música Sem Posição',
        bandId: 'band-uuid-123',
      };

      await service.create(dto);

      expect(prisma.repertoireSong.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          bandId: dto.bandId,
          artist: undefined,
          key: undefined,
          position: 0,
          notes: undefined,
        },
      });
    });

    it('deve lançar NotFoundException se a banda não for encontrada ao criar música', async () => {
      jest.spyOn(prisma.band, 'findUnique').mockResolvedValue(null);

      const dto = {
        title: 'Música Nova',
        bandId: 'band-inexistente',
      };

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('deve retornar todas as músicas do repertório ordenadas por posição quando nenhum bandId for informado', async () => {
      const result = await service.findAll();

      expect(prisma.repertoireSong.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { position: 'asc' },
      });
      expect(result).toEqual([mockSong]);
    });

    it('deve filtrar músicas por bandId quando fornecido', async () => {
      const result = await service.findAll('band-uuid-123');

      expect(prisma.repertoireSong.findMany).toHaveBeenCalledWith({
        where: { bandId: 'band-uuid-123' },
        orderBy: { position: 'asc' },
      });
      expect(result).toEqual([mockSong]);
    });
  });

  describe('findOne', () => {
    it('deve retornar uma música pelo ID se ela existir', async () => {
      const result = await service.findOne('song-uuid-123');

      expect(prisma.repertoireSong.findUnique).toHaveBeenCalledWith({
        where: { id: 'song-uuid-123' },
      });
      expect(result).toEqual(mockSong);
    });

    it('deve lançar NotFoundException se a música não for encontrada', async () => {
      jest.spyOn(prisma.repertoireSong, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar uma música existente', async () => {
      const updateDto = { title: 'Título Atualizado', position: 2 };
      const updatedSong = { ...mockSong, ...updateDto };
      jest.spyOn(prisma.repertoireSong, 'update').mockResolvedValue(updatedSong);

      const result = await service.update('song-uuid-123', updateDto);

      expect(prisma.repertoireSong.update).toHaveBeenCalledWith({
        where: { id: 'song-uuid-123' },
        data: updateDto,
      });
      expect(result.title).toBe('Título Atualizado');
      expect(result.position).toBe(2);
    });

    it('deve lançar NotFoundException ao tentar atualizar uma música inexistente', async () => {
      jest.spyOn(prisma.repertoireSong, 'findUnique').mockResolvedValue(null);

      await expect(
        service.update('id-inexistente', { title: 'Novo Título' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve remover uma música existente pelo ID', async () => {
      const result = await service.remove('song-uuid-123');

      expect(prisma.repertoireSong.delete).toHaveBeenCalledWith({
        where: { id: 'song-uuid-123' },
      });
      expect(result).toEqual(mockSong);
    });

    it('deve lançar NotFoundException ao tentar remover uma música inexistente', async () => {
      jest.spyOn(prisma.repertoireSong, 'findUnique').mockResolvedValue(null);

      await expect(service.remove('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
