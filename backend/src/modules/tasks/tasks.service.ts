import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BandAccessService } from '../band-access/band-access.service';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bandAccessService: BandAccessService,
  ) {}

  async create(createTaskDto: CreateTaskDto, user: CurrentUserPayload) {
    const event = await this.prisma.event.findUnique({
      where: { id: createTaskDto.eventId },
    });

    if (!event) {
      throw new NotFoundException(
        `Evento com ID ${createTaskDto.eventId} não encontrado`,
      );
    }

    await this.bandAccessService.assertMembership(
      user.userId,
      user.role,
      event.bandId,
    );

    return await this.prisma.task.create({
      data: {
        description: createTaskDto.description,
        eventId: createTaskDto.eventId,
        isDone: createTaskDto.isDone ?? false,
      },
    });
  }

  async findAll(user: CurrentUserPayload, eventId?: string) {
    if (eventId) {
      const event = await this.prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        throw new NotFoundException(`Evento com ID ${eventId} não encontrado`);
      }

      await this.bandAccessService.assertMembership(
        user.userId,
        user.role,
        event.bandId,
      );

      return await this.prisma.task.findMany({
        where: { eventId },
      });
    }

    if (user.role === Role.ADMIN) {
      return await this.prisma.task.findMany();
    }

    const bandIds = await this.bandAccessService.getUserBandIds(user.userId);
    return await this.prisma.task.findMany({
      where: {
        event: {
          bandId: { in: bandIds },
        },
      },
    });
  }

  async findOne(id: string, user: CurrentUserPayload) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { event: true },
    });

    if (!task) {
      throw new NotFoundException(`Tarefa com ID ${id} não encontrada`);
    }

    await this.bandAccessService.assertMembership(
      user.userId,
      user.role,
      task.event.bandId,
    );

    return task;
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    user: CurrentUserPayload,
  ) {
    await this.findOne(id, user);

    return await this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    });
  }

  async remove(id: string, user: CurrentUserPayload) {
    await this.findOne(id, user);

    return await this.prisma.task.delete({
      where: { id },
    });
  }
}
