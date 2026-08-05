import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { BandAccessService } from './band-access.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('BandAccessService', () => {
  let service: BandAccessService;
  let prisma: PrismaService;

  const mockBandMember = {
    id: 'member-1',
    userId: 'user-123',
    bandId: 'band-456',
    role: 'MEMBER',
    joinedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BandAccessService,
        {
          provide: PrismaService,
          useValue: {
            bandMember: {
              findFirst: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<BandAccessService>(BandAccessService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('Casos Positivos', () => {
    it('1. membro passa: deve permitir acesso se o usuário for membro da banda', async () => {
      jest.spyOn(prisma.bandMember, 'findFirst').mockResolvedValue(mockBandMember);

      await expect(
        service.assertMembership('user-123', 'MUSICIAN', 'band-456'),
      ).resolves.not.toThrow();

      expect(prisma.bandMember.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-123', bandId: 'band-456' },
      });
    });

    it('2. admin passa: deve permitir acesso se a role for ADMIN mesmo sem vinculo em BandMember', async () => {
      jest.spyOn(prisma.bandMember, 'findFirst').mockResolvedValue(null);

      await expect(
        service.assertMembership('admin-999', 'ADMIN', 'band-456'),
      ).resolves.not.toThrow();

      expect(prisma.bandMember.findFirst).not.toHaveBeenCalled();
    });

    it('3. mais de uma banda: deve retornar array com os IDs de todas as bandas do usuario', async () => {
      jest.spyOn(prisma.bandMember, 'findMany').mockResolvedValue([
        { bandId: 'band-1' },
        { bandId: 'band-2' },
      ] as any);

      const result = await service.getUserBandIds('user-123');

      expect(result).toEqual(['band-1', 'band-2']);
      expect(prisma.bandMember.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        select: { bandId: true },
      });
    });
  });

  describe('Casos Negativos', () => {
    it('1. não-membro: deve lançar ForbiddenException se o usuario não for membro da banda', async () => {
      jest.spyOn(prisma.bandMember, 'findFirst').mockResolvedValue(null);

      await expect(
        service.assertMembership('user-123', 'MUSICIAN', 'band-789'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('2. bandId inexistente: deve lançar ForbiddenException ao tentar acessar bandId invalido/inexistente', async () => {
      jest.spyOn(prisma.bandMember, 'findFirst').mockResolvedValue(null);

      await expect(
        service.assertMembership('user-123', 'MUSICIAN', 'band-inexistente'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('3. userId inexistente: deve lançar ForbiddenException ao consultar usuario inexistente', async () => {
      jest.spyOn(prisma.bandMember, 'findFirst').mockResolvedValue(null);

      await expect(
        service.assertMembership('user-inexistente', 'MUSICIAN', 'band-456'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
