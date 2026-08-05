import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { RepertoireController } from './repertoire.controller';
import { RepertoireService } from './repertoire.service';
import { CreateRepertoireSongDto } from './dto/create-repertoire-song.dto';
import { UpdateRepertoireSongDto } from './dto/update-repertoire-song.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

describe('RepertoireController', () => {
  let controller: RepertoireController;
  let service: RepertoireService;

  const mockUser: CurrentUserPayload = {
    userId: 'user-uuid-123',
    email: 'musician@example.com',
    role: Role.MUSICIAN,
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

  const mockRepertoireService = {
    create: jest.fn().mockResolvedValue(mockSong),
    findAll: jest.fn().mockResolvedValue([mockSong]),
    findOne: jest.fn().mockResolvedValue(mockSong),
    update: jest.fn().mockResolvedValue(mockSong),
    remove: jest.fn().mockResolvedValue(mockSong),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RepertoireController],
      providers: [
        {
          provide: RepertoireService,
          useValue: mockRepertoireService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RepertoireController>(RepertoireController);
    service = module.get<RepertoireService>(RepertoireService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve delegar a criação da música com todos os campos ao RepertoireService', async () => {
      const dto: CreateRepertoireSongDto = {
        title: 'Música Exemplo',
        bandId: 'band-uuid-123',
        artist: 'Artista Exemplo',
        key: 'C#m',
        position: 1,
        notes: 'Intro no violão',
      };

      const result = await controller.create(dto, mockUser);

      expect(service.create).toHaveBeenCalledWith(dto, mockUser);
      expect(result).toEqual(mockSong);
    });

    it('deve delegar a criação com apenas os campos obrigatórios', async () => {
      const dto: CreateRepertoireSongDto = {
        title: 'Música Mínima',
        bandId: 'band-uuid-123',
      };
      jest.spyOn(service, 'create').mockResolvedValueOnce(mockMinimalSong);

      const result = await controller.create(dto, mockUser);

      expect(service.create).toHaveBeenCalledWith(dto, mockUser);
      expect(result).toEqual(mockMinimalSong);
    });

    it('deve repassar NotFoundException se a banda não for encontrada no service', async () => {
      const dto: CreateRepertoireSongDto = {
        title: 'Música Nova',
        bandId: 'band-inexistente',
      };

      jest
        .spyOn(service, 'create')
        .mockRejectedValueOnce(new NotFoundException('Banda não encontrada'));

      await expect(controller.create(dto, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve repassar erro genérico ou de validação vindo do service', async () => {
      const dto: CreateRepertoireSongDto = {
        title: 'Música Inválida',
        bandId: 'band-uuid-123',
      };

      jest
        .spyOn(service, 'create')
        .mockRejectedValueOnce(new BadRequestException('Dados inválidos'));

      await expect(controller.create(dto, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar a lista de músicas chamando o service sem bandId', async () => {
      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([mockSong]);
    });

    it('deve passar o bandId ao service quando fornecido via query', async () => {
      const result = await controller.findAll('band-uuid-123');

      expect(service.findAll).toHaveBeenCalledWith('band-uuid-123');
      expect(result).toEqual([mockSong]);
    });

    it('deve repassar erro retornado pelo service ao listar', async () => {
      jest
        .spyOn(service, 'findAll')
        .mockRejectedValueOnce(new Error('Erro interno do serviço'));

      await expect(controller.findAll('band-uuid-123')).rejects.toThrow(
        'Erro interno do serviço',
      );
    });

    it('deve retornar lista vazia se o service não encontrar músicas para a banda', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValueOnce([]);

      const result = await controller.findAll('band-sem-musicas');

      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalledWith('band-sem-musicas');
    });
  });

  describe('findOne', () => {
    it('deve retornar a música pelo ID chamando o service', async () => {
      const result = await controller.findOne('song-uuid-123', mockUser);

      expect(service.findOne).toHaveBeenCalledWith('song-uuid-123', mockUser);
      expect(result).toEqual(mockSong);
    });

    it('deve retornar outra música pelo ID correspondente', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockMinimalSong);

      const result = await controller.findOne('song-uuid-456', mockUser);

      expect(service.findOne).toHaveBeenCalledWith('song-uuid-456', mockUser);
      expect(result).toEqual(mockMinimalSong);
    });

    it('deve repassar NotFoundException se a música não for encontrada', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValueOnce(new NotFoundException('Música não encontrada'));

      await expect(
        controller.findOne('id-inexistente', mockUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve repassar erro inesperado retornado pelo service', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValueOnce(new Error('Erro no servidor'));

      await expect(
        controller.findOne('song-uuid-123', mockUser),
      ).rejects.toThrow('Erro no servidor');
    });
  });

  describe('update', () => {
    it('deve atualizar a música chamando o service com ID e DTO de título', async () => {
      const dto: UpdateRepertoireSongDto = { title: 'Novo Título' };
      const updatedSong = { ...mockSong, title: 'Novo Título' };

      jest.spyOn(service, 'update').mockResolvedValueOnce(updatedSong);

      const result = await controller.update('song-uuid-123', dto, mockUser);

      expect(service.update).toHaveBeenCalledWith(
        'song-uuid-123',
        dto,
        mockUser,
      );
      expect(result.title).toBe('Novo Título');
    });

    it('deve atualizar múltiplos campos da música chamando o service', async () => {
      const dto: UpdateRepertoireSongDto = {
        artist: 'Novo Artista',
        key: 'Am',
        position: 5,
      };
      const updatedSong = { ...mockSong, ...dto };

      jest.spyOn(service, 'update').mockResolvedValueOnce(updatedSong);

      const result = await controller.update('song-uuid-123', dto, mockUser);

      expect(service.update).toHaveBeenCalledWith(
        'song-uuid-123',
        dto,
        mockUser,
      );
      expect(result.artist).toBe('Novo Artista');
      expect(result.key).toBe('Am');
    });

    it('deve repassar NotFoundException se a música a ser atualizada não for encontrada', async () => {
      jest
        .spyOn(service, 'update')
        .mockRejectedValueOnce(new NotFoundException('Música não encontrada'));

      await expect(
        controller.update('id-inexistente', { title: 'Novo Título' }, mockUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve repassar erro genérico vindo do service durante a atualização', async () => {
      jest
        .spyOn(service, 'update')
        .mockRejectedValueOnce(new Error('Erro ao atualizar registro'));

      await expect(
        controller.update('song-uuid-123', { title: 'Novo Título' }, mockUser),
      ).rejects.toThrow('Erro ao atualizar registro');
    });
  });

  describe('remove', () => {
    it('deve remover a música chamando o service com o ID', async () => {
      const result = await controller.remove('song-uuid-123', mockUser);

      expect(service.remove).toHaveBeenCalledWith('song-uuid-123', mockUser);
      expect(result).toEqual(mockSong);
    });

    it('deve remover outra música confirmando a delegação ao service', async () => {
      jest.spyOn(service, 'remove').mockResolvedValueOnce(mockMinimalSong);

      const result = await controller.remove('song-uuid-456', mockUser);

      expect(service.remove).toHaveBeenCalledWith('song-uuid-456', mockUser);
      expect(result).toEqual(mockMinimalSong);
    });

    it('deve repassar NotFoundException se a música a ser removida não existir', async () => {
      jest
        .spyOn(service, 'remove')
        .mockRejectedValueOnce(new NotFoundException('Música não encontrada'));

      await expect(
        controller.remove('id-inexistente', mockUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve repassar erro genérico se a remoção falhar no service', async () => {
      jest
        .spyOn(service, 'remove')
        .mockRejectedValueOnce(new Error('Erro ao deletar registro'));

      await expect(
        controller.remove('song-uuid-123', mockUser),
      ).rejects.toThrow('Erro ao deletar registro');
    });
  });
});
