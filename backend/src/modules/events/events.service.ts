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

  private async resolveDbUser(user: CurrentUserPayload) {
    const searchConditions: Prisma.UserWhereInput[] = [
      { id: user.userId },
      { supabaseId: user.userId },
    ];
    if (user.email) {
      searchConditions.push({ email: user.email });
    }

    const dbUser = await this.prisma.user.findFirst({
      where: {
        OR: searchConditions,
      },
    });

    if (dbUser) {
      return dbUser;
    }

    return await this.prisma.user.create({
      data: {
        supabaseId: user.userId,
        email: user.email || `${user.userId}@supabase.user`,
        name: '',
        role: user.role || Role.MUSICIAN,
      },
    });
  }

  async create(createEventDto: CreateEventDto, user: CurrentUserPayload) {
    const dbUser = await this.resolveDbUser(user);
    const userId = dbUser.id;
    let resolvedBandId = createEventDto.bandId;

    if (resolvedBandId) {
      await this.bandAccessService.assertMembership(
        userId,
        user.role,
        resolvedBandId,
      );

      const band = await this.prisma.band.findUnique({
        where: { id: resolvedBandId },
      });

      if (!band) {
        throw new NotFoundException(
          `Banda com ID ${resolvedBandId} não encontrada`,
        );
      }
    } else {
      const userBandIds = await this.bandAccessService.getUserBandIds(userId);

      if (userBandIds.length > 0) {
        resolvedBandId = userBandIds[0];
      } else {
        const bandName = dbUser?.name?.trim()
          ? `Projeto Solo - ${dbUser.name.trim()}`
          : 'Minha Banda';

        const newBand = await this.prisma.band.create({
          data: {
            name: bandName,
            members: {
              create: {
                userId,
              },
            },
          },
        });

        resolvedBandId = newBand.id;
      }
    }

    return await this.prisma.event.create({
      data: {
        title: createEventDto.title,
        date: new Date(createEventDto.date),
        location: createEventDto.location,
        description: createEventDto.description,
        status: createEventDto.status ?? EventStatus.PENDING,
        bandId: resolvedBandId,
        createdById: userId,
      },
      include: {
        tasks: true,
      },
    });
  }

  async findAll(user: CurrentUserPayload, bandId?: string) {
    const dbUser = await this.resolveDbUser(user);
    const userId = dbUser.id;

    if (bandId) {
      await this.bandAccessService.assertMembership(
        userId,
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

    const bandIds = await this.bandAccessService.getUserBandIds(userId);
    return await this.prisma.event.findMany({
      where: {
        bandId: { in: bandIds },
      },
      include: { tasks: true },
      orderBy: { date: 'asc' },
    });
  }

  async findOne(id: string, user: CurrentUserPayload) {
    const dbUser = await this.resolveDbUser(user);
    const userId = dbUser.id;

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
      userId,
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
    const dbUser = await this.resolveDbUser(user);
    const userId = dbUser.id;

    if (updateEventDto.bandId) {
      await this.bandAccessService.assertMembership(
        userId,
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
