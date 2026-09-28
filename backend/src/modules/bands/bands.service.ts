import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BandAccessService } from '../band-access/band-access.service';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { CreateBandDto } from './dto/create-band.dto';

@Injectable()
export class BandsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bandAccessService: BandAccessService,
  ) {}

  async create(createBandDto: CreateBandDto, user: CurrentUserPayload) {
    return this.prisma.$transaction(async (transaction) => {
      const searchConditions: Prisma.UserWhereInput[] = [
        { id: user.userId },
        { supabaseId: user.userId },
      ];

      if (user.email) {
        searchConditions.push({ email: user.email });
      }

      const dbUser = await transaction.user.findFirst({
        where: { OR: searchConditions },
        select: { id: true },
      });

      const userId =
        dbUser?.id ??
        (
          await transaction.user.create({
            data: {
              supabaseId: user.userId,
              email: user.email || `${user.userId}@supabase.user`,
              name: '',
              role: user.role || Role.MUSICIAN,
            },
            select: { id: true },
          })
        ).id;

      return transaction.band.create({
        data: {
          name: createBandDto.name,
          members: {
            create: {
              userId,
              role: 'OWNER',
            },
          },
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });
  }

  async findAll(user: CurrentUserPayload) {
    const where =
      user.role === Role.ADMIN
        ? undefined
        : {
            id: {
              in: await this.bandAccessService.getUserBandIds(user.userId),
            },
          };

    return this.prisma.band.findMany({
      where,
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, user: CurrentUserPayload) {
    const band = await this.prisma.band.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!band) {
      throw new NotFoundException(`Banda com ID ${id} não encontrada`);
    }

    await this.bandAccessService.assertMembership(user.userId, user.role, id);

    return band;
  }
}
