import { Test, TestingModule } from '@nestjs/testing';
import { RepertoireService } from './repertoire.service';
import { NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BandAccessService } from '../band-access/band-access.service';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

describe('RepertoireService', () => {
  let service: RepertoireService;
  let prisma: PrismaService;
  let bandAccessService: BandAccessService;

  const mockUser: CurrentUserPayload = {
    userId: 'user-uuid-123',
    email: 'musician@example.com',
    role: Role.MUSICIAN,
  };

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

  const mockMinimalSong = {
    id: 'song-uuid-456',
    title: 'Música Mínima',
    artist: null,
    key: null,
    position: 0,
    notes: null,
    bandId: 'band-uuid-123',
  };

  const mockBandAccessService = {
    assertMembership: jest.fn().mockResolvedValue(undefined),
    getUserBandIds: jest.fn().mockResolvedValue(['band-uuid-123']),
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
        {
          provide: BandAccessService,
          useValue: mockBandAccessService,
        },
      ],
    }).compile();

    service = module.get<RepertoireService>(RepertoireService);
    prisma = module.get<PrismaService>(PrismaService);
    bandAccessService = module.get<BandAccessService>(BandAccessService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar uma nova música no repertório com todos os campos quando a banda existir', async () => {
      const dto = {
        title: 'Música Exemplo',
        bandId: 'band-uuid-123',
        artist: 'Artista Exemplo',
        key: 'C#m',
        position: 1,
        notes: 'Intro no violão',
      };

      const result = await service.create(dto, mockUser);

      expect(bandAccessService.assertMembership).toHaveBeenCalledWith(
        mockUser.userId,
        mockUser.role,
        dto.bandId,
      );
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

      await service.create(dto, mockUser);

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

      await expect(service.create(dto, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve repassar erro do banco de dados se a criação no Prisma falhar', async () => {
      jest
        .spyOn(prisma.repertoireSong, 'create')
        .mockRejectedValue(new Error('Erro de conexão no banco'));

      const dto = {
        title: 'Música Erro',
        bandId: 'band-uuid-123',
      };

      await expect(service.create(dto, mockUser)).rejects.toThrow(
        'Erro de conexão no banco',
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar as músicas das bandas do usuário ordenadas por posição quando nenhum bandId for informado', async () => {
      const result = await service.findAll(mockUser);

      expect(bandAccessService.getUserBandIds).toHaveBeenCalledWith(
        mockUser.userId,
      );
      expect(prisma.repertoireSong.findMany).toHaveBeenCalledWith({
        where: { bandId: { in: ['band-uuid-123'] } },
        orderBy: { position: 'asc' },
      });
      expect(result).toEqual([mockSong]);
    });

    it('deve filtrar músicas por bandId quando fornecido e usuário for membro', async () => {
      const result = await service.findAll(mockUser, 'band-uuid-123');

      expect(bandAccessService.assertMembership).toHaveBeenCalledWith(
        mockUser.userId,
        mockUser.role,
        'band-uuid-123',
      );
      expect(prisma.repertoireSong.findMany).toHaveBeenCalledWith({
        where: { bandId: 'band-uuid-123' },
        orderBy: { position: 'asc' },
      });
      expect(result).toEqual([mockSong]);
    });

    it('deve repassar erro do banco se a consulta findMany falhar', async () => {
      jest
        .spyOn(prisma.repertoireSong, 'findMany')
        .mockRejectedValue(new Error('Erro ao listar no banco'));

      await expect(service.findAll(mockUser, 'band-uuid-123')).rejects.toThrow(
        'Erro ao listar no banco',
      );
    });

    it('deve retornar lista vazia se nenhuma música for encontrada para a banda', async () => {
      jest.spyOn(prisma.repertoireSong, 'findMany').mockResolvedValue([]);

      const result = await service.findAll(mockUser, 'band-sem-musicas');

      expect(result).toEqual([]);
      expect(prisma.repertoireSong.findMany).toHaveBeenCalledWith({
        where: { bandId: 'band-sem-musicas' },
        orderBy: { position: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('deve retornar uma música completa pelo ID se ela existir', async () => {
      const result = await service.findOne('song-uuid-123', mockUser);

      expect(prisma.repertoireSong.findUnique).toHaveBeenCalledWith({
        where: { id: 'song-uuid-123' },
      });
      expect(bandAccessService.assertMembership).toHaveBeenCalledWith(
        mockUser.userId,
        mockUser.role,
        mockSong.bandId,
      );
      expect(result).toEqual(mockSong);
    });

    it('deve retornar uma música com campos opcionais nulos se ela existir', async () => {
      jest
        .spyOn(prisma.repertoireSong, 'findUnique')
        .mockResolvedValue(mockMinimalSong);

      const result = await service.findOne('song-uuid-456', mockUser);

      expect(prisma.repertoireSong.findUnique).toHaveBeenCalledWith({
        where: { id: 'song-uuid-456' },
      });
      expect(result).toEqual(mockMinimalSong);
    });

    it('deve lançar NotFoundException se a música não for encontrada', async () => {
      jest.spyOn(prisma.repertoireSong, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne('id-inexistente', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve repassar erro do banco se a busca por id falhar', async () => {
      jest
        .spyOn(prisma.repertoireSong, 'findUnique')
        .mockRejectedValue(new Error('Erro na busca'));

      await expect(service.findOne('song-uuid-123', mockUser)).rejects.toThrow(
        'Erro na busca',
      );
    });
  });

  describe('update', () => {
    it('deve atualizar o título e posição de uma música existente', async () => {
      const updateDto = { title: 'Título Atualizado', position: 2 };
      const updatedSong = { ...mockSong, ...updateDto };
      jest
        .spyOn(prisma.repertoireSong, 'update')
        .mockResolvedValue(updatedSong);

      const result = await service.update('song-uuid-123', updateDto, mockUser);

      expect(prisma.repertoireSong.update).toHaveBeenCalledWith({
        where: { id: 'song-uuid-123' },
        data: updateDto,
      });
      expect(result.title).toBe('Título Atualizado');
      expect(result.position).toBe(2);
    });

    it('deve atualizar artista, tom e notas de uma música existente', async () => {
      const updateDto = {
        artist: 'Novo Artista',
        key: 'G',
        notes: 'Nova nota',
      };
      const updatedSong = { ...mockSong, ...updateDto };
      jest
        .spyOn(prisma.repertoireSong, 'update')
        .mockResolvedValue(updatedSong);

      const result = await service.update('song-uuid-123', updateDto, mockUser);

      expect(prisma.repertoireSong.update).toHaveBeenCalledWith({
        where: { id: 'song-uuid-123' },
        data: updateDto,
      });
      expect(result.artist).toBe('Novo Artista');
      expect(result.key).toBe('G');
    });

    it('deve lançar NotFoundException ao tentar atualizar uma música inexistente', async () => {
      jest.spyOn(prisma.repertoireSong, 'findUnique').mockResolvedValue(null);

      await expect(
        service.update('id-inexistente', { title: 'Novo Título' }, mockUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve repassar erro do banco se a atualização falhar no Prisma', async () => {
      jest
        .spyOn(prisma.repertoireSong, 'findUnique')
        .mockResolvedValue(mockSong);
      jest
        .spyOn(prisma.repertoireSong, 'update')
        .mockRejectedValue(new Error('Falha no update do banco'));

      await expect(
        service.update('song-uuid-123', { title: 'Novo Título' }, mockUser),
      ).rejects.toThrow('Falha no update do banco');
    });
  });

  describe('remove', () => {
    it('deve remover uma música existente pelo ID', async () => {
      const result = await service.remove('song-uuid-123', mockUser);

      expect(prisma.repertoireSong.delete).toHaveBeenCalledWith({
        where: { id: 'song-uuid-123' },
      });
      expect(result).toEqual(mockSong);
    });

    it('deve remover uma música com dados mínimos pelo ID', async () => {
      jest
        .spyOn(prisma.repertoireSong, 'findUnique')
        .mockResolvedValue(mockMinimalSong);
      jest
        .spyOn(prisma.repertoireSong, 'delete')
        .mockResolvedValue(mockMinimalSong);

      const result = await service.remove('song-uuid-456', mockUser);

      expect(prisma.repertoireSong.delete).toHaveBeenCalledWith({
        where: { id: 'song-uuid-456' },
      });
      expect(result).toEqual(mockMinimalSong);
    });

    it('deve lançar NotFoundException ao tentar remover uma música inexistente', async () => {
      jest.spyOn(prisma.repertoireSong, 'findUnique').mockResolvedValue(null);

      await expect(service.remove('id-inexistente', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve repassar erro do banco se a remoção falhar no Prisma', async () => {
      jest
        .spyOn(prisma.repertoireSong, 'findUnique')
        .mockResolvedValue(mockSong);
      jest
        .spyOn(prisma.repertoireSong, 'delete')
        .mockRejectedValue(new Error('Falha ao deletar no banco'));

      await expect(service.remove('song-uuid-123', mockUser)).rejects.toThrow(
        'Falha ao deletar no banco',
      );
    });
  });
});
