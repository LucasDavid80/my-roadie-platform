import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRepertoireSongDto } from './dto/create-repertoire-song.dto';
import { UpdateRepertoireSongDto } from './dto/update-repertoire-song.dto';

@Injectable()
export class RepertoireService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateRepertoireSongDto) {
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

  async findAll(bandId?: string) {
    const where = bandId ? { bandId } : {};
    return await this.prisma.repertoireSong.findMany({
      where,
      orderBy: { position: 'asc' },
    });
  }

  async findOne(id: string) {
    const song = await this.prisma.repertoireSong.findUnique({
      where: { id },
    });

    if (!song) {
      throw new NotFoundException(
        `Música do repertório com ID ${id} não encontrada`,
      );
    }

    return song;
  }

  async update(id: string, updateDto: UpdateRepertoireSongDto) {
    await this.findOne(id);

    return await this.prisma.repertoireSong.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return await this.prisma.repertoireSong.delete({
      where: { id },
    });
  }
}
