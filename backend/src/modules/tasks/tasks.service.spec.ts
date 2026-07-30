import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

describe('TasksService', () => {
  let service: TasksService;
  let prisma: PrismaService;

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
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar uma nova tarefa quando o evento existir', async () => {
      const dto = {
        description: 'Passagem de som e checagem de cabos',
        eventId: 'event-uuid-123',
        isDone: false,
      };

      const result = await service.create(dto);

      expect(prisma.event.findUnique).toHaveBeenCalledWith({
        where: { id: dto.eventId },
      });
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          description: dto.description,
          eventId: dto.eventId,
          isDone: false,
        },
      });
      expect(result).toEqual(mockTask);
    });

    it('deve lançar NotFoundException se o evento não for encontrado ao criar tarefa', async () => {
      jest.spyOn(prisma.event, 'findUnique').mockResolvedValue(null);

      const dto = {
        description: 'Passagem de som',
        eventId: 'event-inexistente',
      };

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('deve retornar todas as tarefas quando nenhum eventId for informado', async () => {
      const result = await service.findAll();

      expect(prisma.task.findMany).toHaveBeenCalledWith({ where: {} });
      expect(result).toEqual([mockTask]);
    });

    it('deve filtrar tarefas por eventId quando fornecido', async () => {
      const result = await service.findAll('event-uuid-123');

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { eventId: 'event-uuid-123' },
      });
      expect(result).toEqual([mockTask]);
    });
  });

  describe('findOne', () => {
    it('deve retornar uma tarefa pelo ID se ela existir', async () => {
      const result = await service.findOne('task-uuid-123');

      expect(prisma.task.findUnique).toHaveBeenCalledWith({
        where: { id: 'task-uuid-123' },
      });
      expect(result).toEqual(mockTask);
    });

    it('deve lançar NotFoundException se a tarefa não for encontrada', async () => {
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar uma tarefa existente', async () => {
      const updateDto = { isDone: true, description: 'Nova Descrição' };
      const updatedTask = { ...mockTask, ...updateDto };
      jest.spyOn(prisma.task, 'update').mockResolvedValue(updatedTask);

      const result = await service.update('task-uuid-123', updateDto);

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: 'task-uuid-123' },
        data: updateDto,
      });
      expect(result.isDone).toBe(true);
      expect(result.description).toBe('Nova Descrição');
    });

    it('deve lançar NotFoundException ao tentar atualizar uma tarefa inexistente', async () => {
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(null);

      await expect(
        service.update('id-inexistente', { isDone: true }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve remover uma tarefa existente pelo ID', async () => {
      const result = await service.remove('task-uuid-123');

      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: 'task-uuid-123' },
      });
      expect(result).toEqual(mockTask);
    });

    it('deve lançar NotFoundException ao tentar remover uma tarefa inexistente', async () => {
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(null);

      await expect(service.remove('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
