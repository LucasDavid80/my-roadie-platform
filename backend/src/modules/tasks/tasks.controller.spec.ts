import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  const mockUser: CurrentUserPayload = {
    userId: 'user-uuid-1',
    email: 'user@example.com',
    role: Role.MUSICIAN,
  };

  const mockTask = {
    id: 'task-uuid-123',
    description: 'Passagem de som',
    isDone: false,
    eventId: 'event-uuid-123',
    createdAt: new Date(),
  };

  const mockTasksService = {
    create: jest.fn().mockResolvedValue(mockTask),
    findAll: jest.fn().mockResolvedValue([mockTask]),
    findOne: jest.fn().mockResolvedValue(mockTask),
    update: jest.fn().mockResolvedValue(mockTask),
    remove: jest.fn().mockResolvedValue(mockTask),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve delegar a criação da tarefa ao TasksService', async () => {
      const dto: CreateTaskDto = {
        description: 'Passagem de som',
        eventId: 'event-uuid-123',
        isDone: false,
      };

      const result = await controller.create(dto, mockUser);

      expect(service.create).toHaveBeenCalledWith(dto, mockUser);
      expect(result).toEqual(mockTask);
    });

    it('deve repassar NotFoundException se o evento não for encontrado no service', async () => {
      const dto: CreateTaskDto = {
        description: 'Passagem de som',
        eventId: 'event-inexistente',
      };

      jest
        .spyOn(service, 'create')
        .mockRejectedValueOnce(new NotFoundException('Evento não encontrado'));

      await expect(controller.create(dto, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar a lista de tarefas chamando o service sem eventId', async () => {
      const result = await controller.findAll(mockUser);

      expect(service.findAll).toHaveBeenCalledWith(mockUser, undefined);
      expect(result).toEqual([mockTask]);
    });

    it('deve passar o eventId e mockUser ao service quando fornecido via query', async () => {
      const result = await controller.findAll(mockUser, 'event-uuid-123');

      expect(service.findAll).toHaveBeenCalledWith(mockUser, 'event-uuid-123');
      expect(result).toEqual([mockTask]);
    });
  });

  describe('findOne', () => {
    it('deve retornar a tarefa pelo ID chamando o service', async () => {
      const result = await controller.findOne('task-uuid-123', mockUser);

      expect(service.findOne).toHaveBeenCalledWith('task-uuid-123', mockUser);
      expect(result).toEqual(mockTask);
    });

    it('deve repassar NotFoundException se a tarefa não for encontrada', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValueOnce(new NotFoundException('Tarefa não encontrada'));

      await expect(
        controller.findOne('id-inexistente', mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar a tarefa chamando o service com ID, DTO e user', async () => {
      const dto: UpdateTaskDto = { isDone: true };
      const updatedTask = { ...mockTask, isDone: true };

      jest.spyOn(service, 'update').mockResolvedValueOnce(updatedTask);

      const result = await controller.update('task-uuid-123', dto, mockUser);

      expect(service.update).toHaveBeenCalledWith(
        'task-uuid-123',
        dto,
        mockUser,
      );
      expect(result.isDone).toBe(true);
    });

    it('deve repassar NotFoundException se a tarefa a ser atualizada não for encontrada', async () => {
      jest
        .spyOn(service, 'update')
        .mockRejectedValueOnce(new NotFoundException('Tarefa não encontrada'));

      await expect(
        controller.update('id-inexistente', { isDone: true }, mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve remover a tarefa chamando o service com o ID e user', async () => {
      const result = await controller.remove('task-uuid-123', mockUser);

      expect(service.remove).toHaveBeenCalledWith('task-uuid-123', mockUser);
      expect(result).toEqual(mockTask);
    });

    it('deve repassar NotFoundException se a tarefa a ser removida não existir', async () => {
      jest
        .spyOn(service, 'remove')
        .mockRejectedValueOnce(new NotFoundException('Tarefa não encontrada'));

      await expect(
        controller.remove('id-inexistente', mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
