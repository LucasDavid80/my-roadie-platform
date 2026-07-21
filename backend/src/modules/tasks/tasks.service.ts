import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: createTaskDto.eventId },
    });

    if (!event) {
      throw new NotFoundException(
        `Evento com ID ${createTaskDto.eventId} não encontrado`,
      );
    }

    return await this.prisma.task.create({
      data: {
        description: createTaskDto.description,
        eventId: createTaskDto.eventId,
        isDone: createTaskDto.isDone ?? false,
      },
    });
  }

  async findAll(eventId?: string) {
    const where = eventId ? { eventId } : {};
    return await this.prisma.task.findMany({
      where,
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException(`Tarefa com ID ${id} não encontrada`);
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    await this.findOne(id);

    return await this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return await this.prisma.task.delete({
      where: { id },
    });
  }
}
