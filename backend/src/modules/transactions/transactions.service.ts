import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role, TransactionType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BandAccessService } from '../band-access/band-access.service';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

export interface FindAllTransactionsFilters {
  bandId?: string;
  userId?: string;
  eventId?: string;
  type?: TransactionType;
}

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bandAccessService: BandAccessService,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
    user: CurrentUserPayload,
  ) {
    await this.bandAccessService.assertMembership(
      user.userId,
      user.role,
      createTransactionDto.bandId,
    );

    const band = await this.prisma.band.findUnique({
      where: { id: createTransactionDto.bandId },
    });

    if (!band) {
      throw new NotFoundException(
        `Banda com ID ${createTransactionDto.bandId} não encontrada`,
      );
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { id: createTransactionDto.userId },
    });

    if (!dbUser) {
      throw new NotFoundException(
        `Usuário com ID ${createTransactionDto.userId} não encontrado`,
      );
    }

    if (createTransactionDto.eventId) {
      const event = await this.prisma.event.findUnique({
        where: { id: createTransactionDto.eventId },
      });

      if (!event) {
        throw new NotFoundException(
          `Evento com ID ${createTransactionDto.eventId} não encontrado`,
        );
      }
    }

    return await this.prisma.transaction.create({
      data: {
        description: createTransactionDto.description,
        amount: createTransactionDto.amount,
        type: createTransactionDto.type,
        date: new Date(createTransactionDto.date),
        bandId: createTransactionDto.bandId,
        userId: createTransactionDto.userId,
        eventId: createTransactionDto.eventId,
      },
    });
  }

  async findAll(
    filters: FindAllTransactionsFilters = {},
    user: CurrentUserPayload,
  ) {
    const where: Prisma.TransactionWhereInput = {};

    if (filters.bandId) {
      await this.bandAccessService.assertMembership(
        user.userId,
        user.role,
        filters.bandId,
      );
      where.bandId = filters.bandId;
    } else if (user.role === Role.ADMIN) {
      // ADMIN sem bandId especificado tem acesso global
    } else {
      const bandIds = await this.bandAccessService.getUserBandIds(user.userId);
      where.bandId = { in: bandIds };
    }

    if (filters.userId) where.userId = filters.userId;
    if (filters.eventId) where.eventId = filters.eventId;
    if (filters.type) where.type = filters.type;

    return await this.prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string, user: CurrentUserPayload) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException(
        `Transação financeira com ID ${id} não encontrada`,
      );
    }

    await this.bandAccessService.assertMembership(
      user.userId,
      user.role,
      transaction.bandId,
    );

    return transaction;
  }

  async update(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
    user: CurrentUserPayload,
  ) {
    await this.findOne(id, user);

    if (updateTransactionDto.eventId) {
      const event = await this.prisma.event.findUnique({
        where: { id: updateTransactionDto.eventId },
      });

      if (!event) {
        throw new NotFoundException(
          `Evento com ID ${updateTransactionDto.eventId} não encontrado`,
        );
      }
    }

    const data: {
      description?: string;
      amount?: number;
      type?: TransactionType;
      date?: Date;
      eventId?: string;
    } = {};

    if (updateTransactionDto.description !== undefined) {
      data.description = updateTransactionDto.description;
    }
    if (updateTransactionDto.amount !== undefined) {
      data.amount = updateTransactionDto.amount;
    }
    if (updateTransactionDto.type !== undefined) {
      data.type = updateTransactionDto.type;
    }
    if (updateTransactionDto.date !== undefined) {
      data.date = new Date(updateTransactionDto.date);
    }
    if (updateTransactionDto.eventId !== undefined) {
      data.eventId = updateTransactionDto.eventId;
    }

    return await this.prisma.transaction.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, user: CurrentUserPayload) {
    await this.findOne(id, user);

    return await this.prisma.transaction.delete({
      where: { id },
    });
  }
}
