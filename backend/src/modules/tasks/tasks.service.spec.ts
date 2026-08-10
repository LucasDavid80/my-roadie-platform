import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BandAccessService } from '../band-access/band-access.service';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

describe('TasksService', () => {
  let service: TasksService;
  let prisma: PrismaService;
  let bandAccessService: BandAccessService;

  const mockUser: CurrentUserPayload = {
    userId: 'user-uuid-1',
    email: 'user@example.com',
    role: Role.MUSICIAN,
  };

  const mockAdminUser: CurrentUserPayload = {
    userId: 'admin-uuid-1',
    email: 'admin@example.com',
    role: Role.ADMIN,
  };

  const mockNonMemberUser: CurrentUserPayload = {
    userId: 'non-member-uuid',
    email: 'stranger@example.com',
    role: Role.MUSICIAN,
  };

  const mockEvent = {
    id: 'event-uuid-123',
    title: 'Show de Lançamento',
    date: new Date(),
    location: 'Teatro Castro Alves',
    description: 'Show principal de lançamento do álbum',
    createdById: 'user-uuid-1',
    bandId: 'band-uuid-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'CONFIRMED',
  };

  const mockTask = {
    id: 'task-uuid-123',
    description: 'Passagem de som e checagem de cabos',
    isDone: false,
    eventId: 'event-uuid-123',
    createdAt: new Date(),
    event: mockEvent,
  };

  const mockBandAccessService = {
    assertMembership: jest.fn().mockResolvedValue(undefined),
    getUserBandIds: jest.fn().mockResolvedValue(['band-uuid-1']),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: {
            event: {
              findUnique: jest.fn().mockResolvedValue(mockEvent),
            },
            task: {
              create: jest.fn().mockResolvedValue(mockTask),
              findMany: jest.fn().mockResolvedValue([mockTask]),
              findUnique: jest.fn().mockResolvedValue(mockTask),
              update: jest.fn().mockResolvedValue(mockTask),
              delete: jest.fn().mockResolvedValue(mockTask),
            },
          },
        },
        {
          provide: BandAccessService,
          useValue: mockBandAccessService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prisma = module.get<PrismaService>(PrismaService);
    bandAccessService = module.get<BandAccessService>(BandAccessService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar uma nova tarefa quando o evento existir e usuário for membro da banda', async () => {
      const dto = {
        description: 'Passagem de som e checagem de cabos',
        eventId: 'event-uuid-123',
        isDone: false,
      };

      const result = await service.create(dto, mockUser);

      expect(prisma.event.findUnique).toHaveBeenCalledWith({
        where: { id: dto.eventId },
      });
      expect(bandAccessService.assertMembership).toHaveBeenCalledWith(
        mockUser.userId,
        mockUser.role,
        mockEvent.bandId,
      );
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          description: dto.description,
          eventId: dto.eventId,
          isDone: false,
        },
      });
      expect(result).toEqual(mockTask);
    });

    it('deve lançar ForbiddenException se não-membro tentar criar tarefa para evento de outra banda', async () => {
      jest
        .spyOn(bandAccessService, 'assertMembership')
        .mockRejectedValueOnce(
          new ForbiddenException(
            'Você não tem permissão para acessar os recursos desta banda',
          ),
        );

      const dto = {
        description: 'Passagem de som',
        eventId: 'event-uuid-123',
      };

      await expect(service.create(dto, mockNonMemberUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('deve lançar NotFoundException se o evento não for encontrado ao criar tarefa', async () => {
      jest.spyOn(prisma.event, 'findUnique').mockResolvedValue(null);

      const dto = {
        description: 'Passagem de som',
        eventId: 'event-inexistente',
      };

      await expect(service.create(dto, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar tarefas filtradas pelas bandas do usuário quando nenhum eventId for informado', async () => {
      const result = await service.findAll(mockUser);

      expect(bandAccessService.getUserBandIds).toHaveBeenCalledWith(
        mockUser.userId,
      );
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { event: { bandId: { in: ['band-uuid-1'] } } },
      });
      expect(result).toEqual([mockTask]);
    });

    it('deve retornar todas as tarefas sem filtro de banda quando o usuário for ADMIN', async () => {
      const result = await service.findAll(mockAdminUser);

      expect(prisma.task.findMany).toHaveBeenCalledWith();
      expect(result).toEqual([mockTask]);
    });

    it('deve retornar lista vazia quando o usuário não pertencer a nenhuma banda', async () => {
      jest.spyOn(bandAccessService, 'getUserBandIds').mockResolvedValueOnce([]);
      jest.spyOn(prisma.task, 'findMany').mockResolvedValueOnce([]);

      const result = await service.findAll(mockNonMemberUser);

      expect(bandAccessService.getUserBandIds).toHaveBeenCalledWith(
        'non-member-uuid',
      );
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { event: { bandId: { in: [] } } },
      });
      expect(result).toEqual([]);
    });

    it('deve filtrar tarefas por eventId quando fornecido e checar associação', async () => {
      const result = await service.findAll(mockUser, 'event-uuid-123');

      expect(prisma.event.findUnique).toHaveBeenCalledWith({
        where: { id: 'event-uuid-123' },
      });
      expect(bandAccessService.assertMembership).toHaveBeenCalledWith(
        mockUser.userId,
        mockUser.role,
        mockEvent.bandId,
      );
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { eventId: 'event-uuid-123' },
      });
      expect(result).toEqual([mockTask]);
    });
  });

  describe('findOne', () => {
    it('deve retornar uma tarefa pelo ID se ela existir e usuário for membro da banda', async () => {
      const result = await service.findOne('task-uuid-123', mockUser);

      expect(prisma.task.findUnique).toHaveBeenCalledWith({
        where: { id: 'task-uuid-123' },
        include: { event: true },
      });
      expect(bandAccessService.assertMembership).toHaveBeenCalledWith(
        mockUser.userId,
        mockUser.role,
        mockEvent.bandId,
      );
      expect(result).toEqual(mockTask);
    });

    it('deve lançar ForbiddenException se não-membro tentar visualizar tarefa de outra banda', async () => {
      jest
        .spyOn(bandAccessService, 'assertMembership')
        .mockRejectedValueOnce(
          new ForbiddenException(
            'Você não tem permissão para acessar os recursos desta banda',
          ),
        );

      await expect(
        service.findOne('task-uuid-123', mockNonMemberUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar NotFoundException se a tarefa não for encontrada', async () => {
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne('id-inexistente', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar uma tarefa existente quando o usuário for membro da banda', async () => {
      const updateDto = { isDone: true, description: 'Nova Descrição' };
      const updatedTask = { ...mockTask, ...updateDto };
      jest.spyOn(prisma.task, 'update').mockResolvedValue(updatedTask);

      const result = await service.update('task-uuid-123', updateDto, mockUser);

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: 'task-uuid-123' },
        data: updateDto,
      });
      expect(result.isDone).toBe(true);
      expect(result.description).toBe('Nova Descrição');
    });

    it('deve lançar ForbiddenException se não-membro tentar atualizar tarefa de outra banda', async () => {
      jest
        .spyOn(bandAccessService, 'assertMembership')
        .mockRejectedValueOnce(
          new ForbiddenException(
            'Você não tem permissão para acessar os recursos desta banda',
          ),
        );

      await expect(
        service.update('task-uuid-123', { isDone: true }, mockNonMemberUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar NotFoundException ao tentar atualizar uma tarefa inexistente', async () => {
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(null);

      await expect(
        service.update('id-inexistente', { isDone: true }, mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve remover uma tarefa existente pelo ID quando o usuário for membro da banda', async () => {
      const result = await service.remove('task-uuid-123', mockUser);

      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: 'task-uuid-123' },
      });
      expect(result).toEqual(mockTask);
    });

    it('deve lançar ForbiddenException se não-membro tentar remover tarefa de outra banda', async () => {
      jest
        .spyOn(bandAccessService, 'assertMembership')
        .mockRejectedValueOnce(
          new ForbiddenException(
            'Você não tem permissão para acessar os recursos desta banda',
          ),
        );

      await expect(
        service.remove('task-uuid-123', mockNonMemberUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar NotFoundException ao tentar remover uma tarefa inexistente', async () => {
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(null);

      await expect(service.remove('id-inexistente', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
