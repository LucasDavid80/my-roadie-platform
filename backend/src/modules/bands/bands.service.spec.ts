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

  it('deve criar o usuário no banco quando ele ainda não existir e o token não tiver e-mail', async () => {
    const transaction = {
      user: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'created-user' }),
      },
      band: {
        create: jest.fn().mockResolvedValue(band),
      },
    };
    prisma.$transaction.mockImplementationOnce(
      (callback: (tx: typeof transaction) => unknown) => callback(transaction),
    );
    const userWithoutEmail = {
      userId: 'user-new',
    } as CurrentUserPayload;

    await expect(
      service.create({ name: 'Banda Nova' }, userWithoutEmail),
    ).resolves.toEqual(band);
    expect(transaction.user.create).toHaveBeenCalledWith({
      data: {
        supabaseId: 'user-new',
        email: 'user-new@supabase.user',
        name: '',
        role: Role.MUSICIAN,
      },
      select: { id: true },
    });
    expect(transaction.band.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          members: {
            create: { userId: 'created-user', role: 'OWNER' },
          },
        }) as Record<string, unknown>,
      }),
    );
  });

  it('deve atualizar o nome da banda para o OWNER', async () => {
    await expect(
      service.update('band-1', { name: 'Banda Atualizada' }, musician),
    ).resolves.toEqual({ ...band, name: 'Banda Atualizada' });
    expect(prisma.band.update).toHaveBeenCalledWith({
      where: { id: 'band-1' },
      data: { name: 'Banda Atualizada' },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  it('deve atualizar sem alterar o nome quando ele não for enviado', async () => {
    await service.update('band-1', {}, musician);

    expect(prisma.band.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: {} }),
    );
  });

  it('deve negar edição para usuário que não é owner', async () => {
    prisma.bandMember.findFirst.mockResolvedValueOnce(null);

    await expect(
      service.update('band-1', { name: 'Banda Atualizada' }, musician),
    ).rejects.toThrow(ForbiddenException);
  });

  it('deve permitir edição por ADMIN sem consultar vínculo de owner', async () => {
    prisma.bandMember.findFirst.mockResolvedValueOnce(null);

    await expect(
      service.update('band-1', { name: 'Banda Atualizada' }, admin),
    ).resolves.toEqual({ ...band, name: 'Banda Atualizada' });
    expect(prisma.bandMember.findFirst).not.toHaveBeenCalled();
  });

  it('deve informar quando a banda não existe na edição', async () => {
    prisma.band.findUnique.mockResolvedValueOnce(null);

    await expect(
      service.update('missing-band', { name: 'Banda Atualizada' }, musician),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve excluir membros e banda quando não houver recursos vinculados', async () => {
    const transaction = {
      event: { count: jest.fn().mockResolvedValue(0) },
      repertoireSong: { count: jest.fn().mockResolvedValue(0) },
      transaction: { count: jest.fn().mockResolvedValue(0) },
      bandMember: { deleteMany: jest.fn() },
      band: { delete: jest.fn() },
    };
    prisma.$transaction.mockImplementationOnce(
      (callback: (tx: typeof transaction) => unknown) => callback(transaction),
    );

    await service.remove('band-1', musician);

    expect(transaction.bandMember.deleteMany).toHaveBeenCalledWith({
      where: { bandId: 'band-1' },
    });
    expect(transaction.band.delete).toHaveBeenCalledWith({
      where: { id: 'band-1' },
    });
  });

  it('deve impedir exclusão quando existirem músicas de repertório', async () => {
    const transaction = {
      event: { count: jest.fn().mockResolvedValue(0) },
      repertoireSong: { count: jest.fn().mockResolvedValue(1) },
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

  it('deve impedir exclusão quando existirem transações', async () => {
    const transaction = {
      event: { count: jest.fn().mockResolvedValue(0) },
      repertoireSong: { count: jest.fn().mockResolvedValue(0) },
      transaction: { count: jest.fn().mockResolvedValue(1) },
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
