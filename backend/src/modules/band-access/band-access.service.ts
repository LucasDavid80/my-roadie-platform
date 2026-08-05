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
      where: { userId },
      select: { bandId: true },
    });
    return members.map((m) => m.bandId);
  }

  /**
   * Valida se o usuário tem acesso à banda especificada.
   * Se for ADMIN, permite o acesso direto.
   * Caso contrário, verifica se existe associação em BandMember. Lança ForbiddenException se não for membro.
   */
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
        userId,
        bandId,
      },
    });

    if (!member) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar os recursos desta banda',
      );
    }
  }
}
