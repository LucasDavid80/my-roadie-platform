import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BandAccessService } from '../band-access/band-access.service';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { CreateBandDto } from './dto/create-band.dto';
import { UpdateBandDto } from './dto/update-band.dto';

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

  private async assertManagementAccess(id: string, user: CurrentUserPayload) {
    const band = await this.prisma.band.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!band) {
      throw new NotFoundException(`Banda com ID ${id} não encontrada`);
    }

    if (user.role === Role.ADMIN) {
      return band;
    }

    const owner = await this.prisma.bandMember.findFirst({
      where: {
        bandId: id,
        role: 'OWNER',
        OR: [{ userId: user.userId }, { user: { supabaseId: user.userId } }],
      },
      select: { id: true },
    });

    if (!owner) {
      throw new ForbiddenException(
        'Apenas o proprietário da banda pode realizar esta operação',
      );
    }

    return band;
  }

  async update(
    id: string,
    updateBandDto: UpdateBandDto,
    user: CurrentUserPayload,
  ) {
    await this.assertManagementAccess(id, user);

    return this.prisma.band.update({
      where: { id },
      data:
        updateBandDto.name === undefined ? {} : { name: updateBandDto.name },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string, user: CurrentUserPayload) {
    await this.assertManagementAccess(id, user);

    await this.prisma.$transaction(async (transaction) => {
      const [eventCount, repertoireCount, transactionCount] = await Promise.all(
        [
          transaction.event.count({ where: { bandId: id } }),
          transaction.repertoireSong.count({ where: { bandId: id } }),
          transaction.transaction.count({ where: { bandId: id } }),
        ],
      );

      if (eventCount > 0 || repertoireCount > 0 || transactionCount > 0) {
        throw new ConflictException(
          'A banda não pode ser excluída enquanto possuir eventos, músicas de repertório ou transações vinculadas',
        );
      }

      await transaction.bandMember.deleteMany({ where: { bandId: id } });
      await transaction.band.delete({ where: { id } });
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
