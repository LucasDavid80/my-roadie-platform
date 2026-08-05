import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BandAccessService } from '../band-access/band-access.service';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { CreateRepertoireSongDto } from './dto/create-repertoire-song.dto';
import { UpdateRepertoireSongDto } from './dto/update-repertoire-song.dto';

@Injectable()
export class RepertoireService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bandAccessService: BandAccessService,
  ) {}

  async create(createDto: CreateRepertoireSongDto, user: CurrentUserPayload) {
    await this.bandAccessService.assertMembership(
      user.userId,
      user.role,
      createDto.bandId,
    );

    const band = await this.prisma.band.findUnique({
      where: { id: createDto.bandId },
    });

    if (!band) {
      throw new NotFoundException(
        `Banda com ID ${createDto.bandId} não encontrada`,
      );
    }

    return await this.prisma.repertoireSong.create({
      data: {
        title: createDto.title,
        bandId: createDto.bandId,
        artist: createDto.artist,
        key: createDto.key,
        position: createDto.position ?? 0,
        notes: createDto.notes,
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
      return await this.prisma.repertoireSong.findMany({
        where: { bandId },
        orderBy: { position: 'asc' },
      });
    }

    if (user.role === Role.ADMIN) {
      return await this.prisma.repertoireSong.findMany({
        orderBy: { position: 'asc' },
      });
    }

    const bandIds = await this.bandAccessService.getUserBandIds(user.userId);
    return await this.prisma.repertoireSong.findMany({
      where: { bandId: { in: bandIds } },
      orderBy: { position: 'asc' },
    });
  }

  async findOne(id: string, user: CurrentUserPayload) {
    const song = await this.prisma.repertoireSong.findUnique({
      where: { id },
    });

    if (!song) {
      throw new NotFoundException(
        `Música do repertório com ID ${id} não encontrada`,
      );
    }

    await this.bandAccessService.assertMembership(
      user.userId,
      user.role,
      song.bandId,
    );

    return song;
  }

  async update(
    id: string,
    updateDto: UpdateRepertoireSongDto,
    user: CurrentUserPayload,
  ) {
    await this.findOne(id, user);

    return await this.prisma.repertoireSong.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string, user: CurrentUserPayload) {
    await this.findOne(id, user);

    return await this.prisma.repertoireSong.delete({
      where: { id },
    });
  }
}
