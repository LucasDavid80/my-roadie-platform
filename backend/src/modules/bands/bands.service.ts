import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BandAccessService } from '../band-access/band-access.service';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Injectable()
export class BandsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bandAccessService: BandAccessService,
  ) {}

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

    await this.bandAccessService.assertMembership(
      user.userId,
      user.role,
      id,
    );

    return band;
  }
}
