import { Injectable, NotFoundException } from '@nestjs/common';
import { EventStatus, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BandAccessService } from '../band-access/band-access.service';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bandAccessService: BandAccessService,
  ) {}

  async create(createEventDto: CreateEventDto, user: CurrentUserPayload) {
    await this.bandAccessService.assertMembership(
      user.userId,
      user.role,
      createEventDto.bandId,
    );

    const band = await this.prisma.band.findUnique({
      where: { id: createEventDto.bandId },
    });

    if (!band) {
      throw new NotFoundException(
        `Banda com ID ${createEventDto.bandId} não encontrada`,
      );
    }

    return await this.prisma.event.create({
      data: {
        title: createEventDto.title,
        date: new Date(createEventDto.date),
        location: createEventDto.location,
        description: createEventDto.description,
        status: createEventDto.status ?? EventStatus.PENDING,
        bandId: createEventDto.bandId,
        createdById: user.userId,
      },
      include: {
        tasks: true,
      },
    });
  }

  async findAll(user: CurrentUserPayload, bandId?: string) {
    if (bandId) {
      await this.bandAccessService.assertMembership(
        user.userId,
        user.role,
        bandId,
      );
      return await this.prisma.event.findMany({
        where: { bandId },
        include: { tasks: true },
        orderBy: { date: 'asc' },
      });
    }

    if (user.role === Role.ADMIN) {
      return await this.prisma.event.findMany({
        include: { tasks: true },
        orderBy: { date: 'asc' },
      });
    }

    const bandIds = await this.bandAccessService.getUserBandIds(user.userId);
    return await this.prisma.event.findMany({
      where: {
        bandId: { in: bandIds },
      },
      include: { tasks: true },
      orderBy: { date: 'asc' },
    });
  }

  async findOne(id: string, user: CurrentUserPayload) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        tasks: true,
        band: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Evento com ID ${id} não encontrado`);
    }

    await this.bandAccessService.assertMembership(
      user.userId,
      user.role,
      event.bandId,
    );

    return event;
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    user: CurrentUserPayload,
  ) {
    await this.findOne(id, user);

    if (updateEventDto.bandId) {
      await this.bandAccessService.assertMembership(
        user.userId,
        user.role,
        updateEventDto.bandId,
      );

      const band = await this.prisma.band.findUnique({
        where: { id: updateEventDto.bandId },
      });

      if (!band) {
        throw new NotFoundException(
          `Banda com ID ${updateEventDto.bandId} não encontrada`,
        );
      }
    }

    const data: Prisma.EventUpdateInput = {};
    if (updateEventDto.title !== undefined) {
      data.title = updateEventDto.title;
    }
    if (updateEventDto.date !== undefined) {
      data.date = new Date(updateEventDto.date);
    }
    if (updateEventDto.location !== undefined) {
      data.location = updateEventDto.location;
    }
    if (updateEventDto.description !== undefined) {
      data.description = updateEventDto.description;
    }
    if (updateEventDto.status !== undefined) {
      data.status = updateEventDto.status;
    }
    if (updateEventDto.bandId !== undefined) {
      data.band = { connect: { id: updateEventDto.bandId } };
    }

    return await this.prisma.event.update({
      where: { id },
      data,
      include: {
        tasks: true,
      },
    });
  }

  async remove(id: string, user: CurrentUserPayload) {
    await this.findOne(id, user);

    return await this.prisma.event.delete({
      where: { id },
    });
  }
}
