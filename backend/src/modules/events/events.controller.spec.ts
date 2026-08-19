import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventStatus, Role } from '@prisma/client';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

describe('EventsController', () => {
  let controller: EventsController;
  let service: EventsService;

  const mockUser: CurrentUserPayload = {
    userId: 'user-uuid-1',
    email: 'user@example.com',
    role: Role.MUSICIAN,
  };

  const mockEvent = {
    id: 'event-uuid-123',
    title: 'Show no Festival de Verão',
    date: new Date('2026-10-15T20:00:00.000Z'),
    startTime: '19:30',
    endTime: '22:00',
    type: 'Show',
    fee: 1500,
    location: 'Concha Acústica',
    description: 'Apresentação principal do festival',
    status: EventStatus.PENDING,
    bandId: 'band-uuid-1',
    createdById: 'user-uuid-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEventsService = {
    create: jest.fn().mockResolvedValue(mockEvent),
    findAll: jest.fn().mockResolvedValue([mockEvent]),
    findOne: jest.fn().mockResolvedValue(mockEvent),
    update: jest.fn().mockResolvedValue(mockEvent),
    remove: jest.fn().mockResolvedValue(mockEvent),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<EventsController>(EventsController);
    service = module.get<EventsService>(EventsService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve delegar a criação do evento ao EventsService', async () => {
      const dto: CreateEventDto = {
        title: 'Show no Festival de Verão',
        date: '2026-10-15T20:00:00.000Z',
        startTime: '19:30',
        endTime: '22:00',
        type: 'Show',
        fee: 1500,
        location: 'Concha Acústica',
        description: 'Apresentação principal do festival',
        bandId: 'band-uuid-1',
      };

      const result = await controller.create(dto, mockUser);

      expect(service.create).toHaveBeenCalledWith(dto, mockUser);
      expect(result).toEqual(mockEvent);
    });

    it('deve repassar NotFoundException se a banda não for encontrada no service', async () => {
      const dto: CreateEventDto = {
        title: 'Show Sem Banda',
        date: '2026-10-15T20:00:00.000Z',
        location: 'Local',
        bandId: 'band-inexistente',
      };

      jest
        .spyOn(service, 'create')
        .mockRejectedValueOnce(new NotFoundException('Banda não encontrada'));

      await expect(controller.create(dto, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar a lista de eventos chamando o service sem bandId', async () => {
      const result = await controller.findAll(mockUser);

      expect(service.findAll).toHaveBeenCalledWith(mockUser, undefined);
      expect(result).toEqual([mockEvent]);
    });

    it('deve passar o bandId e user ao service quando fornecido via query', async () => {
      const result = await controller.findAll(mockUser, 'band-uuid-1');

      expect(service.findAll).toHaveBeenCalledWith(mockUser, 'band-uuid-1');
      expect(result).toEqual([mockEvent]);
    });
  });

  describe('findOne', () => {
    it('deve retornar o evento pelo ID chamando o service', async () => {
      const result = await controller.findOne('event-uuid-123', mockUser);

      expect(service.findOne).toHaveBeenCalledWith('event-uuid-123', mockUser);
      expect(result).toEqual(mockEvent);
    });

    it('deve repassar NotFoundException se o evento não for encontrado', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValueOnce(new NotFoundException('Evento não encontrado'));

      await expect(
        controller.findOne('id-inexistente', mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar o evento chamando o service com ID, DTO e user', async () => {
      const dto: UpdateEventDto = {
        title: 'Show Atualizado',
        startTime: '20:00',
        endTime: '23:00',
        type: 'Show',
        fee: 2000,
      };
      const updatedEvent = { ...mockEvent, ...dto };

      jest.spyOn(service, 'update').mockResolvedValueOnce(updatedEvent);

      const result = await controller.update('event-uuid-123', dto, mockUser);

      expect(service.update).toHaveBeenCalledWith(
        'event-uuid-123',
        dto,
        mockUser,
      );
      expect(result.title).toBe('Show Atualizado');
    });

    it('deve repassar NotFoundException se o evento a ser atualizado não for encontrado', async () => {
      jest
        .spyOn(service, 'update')
        .mockRejectedValueOnce(new NotFoundException('Evento não encontrado'));

      await expect(
        controller.update('id-inexistente', { title: 'Novo' }, mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve remover o evento chamando o service com o ID e user', async () => {
      const result = await controller.remove('event-uuid-123', mockUser);

      expect(service.remove).toHaveBeenCalledWith('event-uuid-123', mockUser);
      expect(result).toEqual(mockEvent);
    });

    it('deve repassar NotFoundException se o evento a ser removido não existir', async () => {
      jest
        .spyOn(service, 'remove')
        .mockRejectedValueOnce(new NotFoundException('Evento não encontrado'));

      await expect(
        controller.remove('id-inexistente', mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
