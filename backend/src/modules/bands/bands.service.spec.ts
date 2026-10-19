import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { BandsService } from './bands.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BandAccessService } from '../band-access/band-access.service';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

describe('BandsService', () => {
  let service: BandsService;
  let prisma: {
    $transaction: jest.Mock;
    band: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    bandMember: {
      findFirst: jest.Mock;
    };
  };
  let bandAccessService: {
    getUserBandIds: jest.Mock;
    assertMembership: jest.Mock;
  };

  const musician: CurrentUserPayload = {
    userId: 'user-1',
    email: 'musician@example.com',
    role: Role.MUSICIAN,
  };
  const admin: CurrentUserPayload = {
    userId: 'admin-1',
    email: 'admin@example.com',
    role: Role.ADMIN,
  };
  const band = {
    id: 'band-1',
    name: 'Banda Exemplo',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const transaction = {
      user: {
        findFirst: jest.fn().mockResolvedValue({ id: 'user-1' }),
        create: jest.fn(),
      },
      band: {
        create: jest.fn().mockResolvedValue(band),
      },
    };

    prisma = {
      $transaction: jest.fn((callback: (tx: typeof transaction) => unknown) =>
        callback(transaction),
      ),
      band: {
        findMany: jest.fn().mockResolvedValue([band]),
        findUnique: jest.fn().mockResolvedValue(band),
        update: jest
          .fn()
          .mockResolvedValue({ ...band, name: 'Banda Atualizada' }),
      },
      bandMember: {
        findFirst: jest.fn().mockResolvedValue({ id: 'member-1' }),
      },
    };
    bandAccessService = {
      getUserBandIds: jest.fn().mockResolvedValue(['band-1']),
      assertMembership: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BandsService,
        { provide: PrismaService, useValue: prisma },
        { provide: BandAccessService, useValue: bandAccessService },
      ],
    }).compile();

    service = module.get(BandsService);
  });

  it('deve criar a banda e associar o criador como OWNER em uma transação', async () => {
    const result = await service.create({ name: 'Banda Exemplo' }, musician);

    expect(result).toEqual(band);
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('deve listar somente as bandas acessíveis ao usuário', async () => {
    const result = await service.findAll(musician);

    expect(bandAccessService.getUserBandIds).toHaveBeenCalledWith('user-1');
    expect(prisma.band.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['band-1'] } },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: 'asc' },
    });
    expect(result).toEqual([band]);
  });

  it('deve permitir que ADMIN liste bandas sem filtro de associação', async () => {
    await service.findAll(admin);

    expect(bandAccessService.getUserBandIds).not.toHaveBeenCalled();
    expect(prisma.band.findMany).toHaveBeenCalledWith({
      where: undefined,
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: 'asc' },
    });
  });

  it('deve negar detalhes da banda para não membro', async () => {
    bandAccessService.assertMembership.mockRejectedValueOnce(
      new ForbiddenException('Você não tem permissão'),
    );

    await expect(service.findOne('band-1', musician)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('deve permitir que ADMIN acesse detalhes sem ser membro', async () => {
    await expect(service.findOne('band-1', admin)).resolves.toEqual(band);
    expect(bandAccessService.assertMembership).toHaveBeenCalledWith(
      'admin-1',
      Role.ADMIN,
      'band-1',
    );
  });

  it('deve informar quando a banda não existe', async () => {
    prisma.band.findUnique.mockResolvedValueOnce(null);

    await expect(service.findOne('missing-band', musician)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deve impedir exclusão quando existem recursos vinculados', async () => {
    const transaction = {
      event: { count: jest.fn().mockResolvedValue(1) },
      repertoireSong: { count: jest.fn().mockResolvedValue(0) },
      transaction: { count: jest.fn().mockResolvedValue(0) },
      bandMember: { deleteMany: jest.fn() },
      band: { delete: jest.fn() },
    };
    prisma.$transaction.mockImplementationOnce(
      (callback: (tx: typeof transaction) => unknown) => callback(transaction),
    );

    await expect(service.remove('band-1', musician)).rejects.toThrow(
      ConflictException,
    );
    expect(transaction.band.delete).not.toHaveBeenCalled();
  });
});
