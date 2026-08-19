import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BandAccessService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retorna os IDs das bandas das quais o usuário é membro.
   */
  async getUserBandIds(userId: string): Promise<string[]> {
    const members = await this.prisma.bandMember.findMany({
      where: {
        OR: [{ userId }, { user: { supabaseId: userId } }],
      },
      select: { bandId: true },
    });
    return members.map((m) => m.bandId);
  }

  async assertMembership(
    userId: string,
    role: string,
    bandId: string,
  ): Promise<void> {
    if (role === 'ADMIN') {
      return;
    }

    const member = await this.prisma.bandMember.findFirst({
      where: {
        bandId,
        OR: [{ userId }, { user: { supabaseId: userId } }],
      },
    });

    if (!member) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar os recursos desta banda',
      );
    }
  }
}
