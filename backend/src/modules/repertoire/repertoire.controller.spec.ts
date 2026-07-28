import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RepertoireController } from './repertoire.controller';
import { RepertoireService } from './repertoire.service';
import { CreateRepertoireSongDto } from './dto/create-repertoire-song.dto';
import { UpdateRepertoireSongDto } from './dto/update-repertoire-song.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('RepertoireController', () => {
  let controller: RepertoireController;
  let service: RepertoireService;

  const mockSong = {
    id: 'song-uuid-123',
    title: 'Música Exemplo',
    artist: 'Artista Exemplo',
    key: 'C#m',
    position: 1,
    notes: 'Intro no violão',
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
    it('deve delegar a criação da música ao RepertoireService', async () => {
      const dto: CreateRepertoireSongDto = {
        title: 'Música Exemplo',
        bandId: 'band-uuid-123',
        artist: 'Artista Exemplo',
        key: 'C#m',
        position: 1,
        notes: 'Intro no violão',
      };

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockSong);
    });

    it('deve repassar NotFoundException se a banda não for encontrada no service', async () => {
      const dto: CreateRepertoireSongDto = {
        title: 'Música Nova',
        bandId: 'band-inexistente',
      };

      jest
        .spyOn(service, 'create')
        .mockRejectedValueOnce(new NotFoundException('Banda não encontrada'));

      await expect(controller.create(dto)).rejects.toThrow(NotFoundException);
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
  });

  describe('findOne', () => {
    it('deve retornar a música pelo ID chamando o service', async () => {
      const result = await controller.findOne('song-uuid-123');

      expect(service.findOne).toHaveBeenCalledWith('song-uuid-123');
      expect(result).toEqual(mockSong);
    });

    it('deve repassar NotFoundException se a música não for encontrada', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValueOnce(new NotFoundException('Música não encontrada'));

      await expect(controller.findOne('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar a música chamando o service com ID e DTO', async () => {
      const dto: UpdateRepertoireSongDto = { title: 'Novo Título' };
      const updatedSong = { ...mockSong, title: 'Novo Título' };

      jest.spyOn(service, 'update').mockResolvedValueOnce(updatedSong);

      const result = await controller.update('song-uuid-123', dto);

      expect(service.update).toHaveBeenCalledWith('song-uuid-123', dto);
      expect(result.title).toBe('Novo Título');
    });

    it('deve repassar NotFoundException se a música a ser atualizada não for encontrada', async () => {
      jest
        .spyOn(service, 'update')
        .mockRejectedValueOnce(new NotFoundException('Música não encontrada'));

      await expect(
        controller.update('id-inexistente', { title: 'Novo Título' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve remover a música chamando o service com o ID', async () => {
      const result = await controller.remove('song-uuid-123');

      expect(service.remove).toHaveBeenCalledWith('song-uuid-123');
      expect(result).toEqual(mockSong);
    });

    it('deve repassar NotFoundException se a música a ser removida não existir', async () => {
      jest
        .spyOn(service, 'remove')
        .mockRejectedValueOnce(new NotFoundException('Música não encontrada'));

      await expect(controller.remove('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
