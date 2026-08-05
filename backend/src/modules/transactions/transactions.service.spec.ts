import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Role, TransactionType } from '@prisma/client';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BandAccessService } from '../band-access/band-access.service';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prisma: PrismaService;
  let bandAccessService: BandAccessService;

  const mockUserPayload: CurrentUserPayload = {
    userId: 'user-uuid-1',
    email: 'musician@example.com',
    role: Role.MUSICIAN,
  };

  const mockBand = {
    id: 'band-uuid-1',
    name: 'Banda Exemplo',
  };

  const mockUser = {
    id: 'user-uuid-1',
    name: 'Músico Exemplo',
  };

  const mockEvent = {
    id: 'event-uuid-1',
    title: 'Show de Exemplo',
  };

  const mockTransaction = {
    id: 'transaction-uuid-1',
    description: 'Cachê do show',
    amount: 1500.0,
    type: TransactionType.INCOME,
    date: new Date('2026-07-28T00:00:00.000Z'),
    createdAt: new Date(),
    bandId: 'band-uuid-1',
    userId: 'user-uuid-1',
    eventId: 'event-uuid-1',
  };

  const mockBandAccessService = {
    assertMembership: jest.fn().mockResolvedValue(undefined),
    getUserBandIds: jest.fn().mockResolvedValue(['band-uuid-1']),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: PrismaService,
          useValue: {
            band: {
              findUnique: jest.fn().mockResolvedValue(mockBand),
            },
            user: {
              findUnique: jest.fn().mockResolvedValue(mockUser),
            },
            event: {
              findUnique: jest.fn().mockResolvedValue(mockEvent),
            },
            transaction: {
              create: jest.fn().mockResolvedValue(mockTransaction),
              findMany: jest.fn().mockResolvedValue([mockTransaction]),
              findUnique: jest.fn().mockResolvedValue(mockTransaction),
              update: jest.fn().mockResolvedValue(mockTransaction),
              delete: jest.fn().mockResolvedValue(mockTransaction),
            },
          },
        },
        {
          provide: BandAccessService,
          useValue: mockBandAccessService,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    prisma = module.get<PrismaService>(PrismaService);
    bandAccessService = module.get<BandAccessService>(BandAccessService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar uma nova transação com sucesso quando todos os dados e eventId forem válidos', async () => {
      const dto: CreateTransactionDto = {
        description: 'Cachê do show',
        amount: 1500.0,
        type: TransactionType.INCOME,
        date: '2026-07-28T00:00:00.000Z',
        bandId: 'band-uuid-1',
        userId: 'user-uuid-1',
        eventId: 'event-uuid-1',
      };

      const result = await service.create(dto, mockUserPayload);

      expect(bandAccessService.assertMembership).toHaveBeenCalledWith(
        mockUserPayload.userId,
        mockUserPayload.role,
        dto.bandId,
      );
      expect(prisma.band.findUnique).toHaveBeenCalledWith({
        where: { id: dto.bandId },
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: dto.userId },
      });
      expect(prisma.event.findUnique).toHaveBeenCalledWith({
        where: { id: dto.eventId },
      });
      expect(prisma.transaction.create).toHaveBeenCalled();
      expect(result).toEqual(mockTransaction);
    });

    it('deve criar uma nova transação com sucesso sem eventId', async () => {
      const dto: CreateTransactionDto = {
        description: 'Compra de cordas',
        amount: 50.0,
        type: TransactionType.EXPENSE,
        date: '2026-07-28T00:00:00.000Z',
        bandId: 'band-uuid-1',
        userId: 'user-uuid-1',
      };

      const result = await service.create(dto, mockUserPayload);

      expect(prisma.band.findUnique).toHaveBeenCalledWith({
        where: { id: dto.bandId },
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: dto.userId },
      });
      expect(prisma.transaction.create).toHaveBeenCalled();
      expect(result).toEqual(mockTransaction);
    });

    it('deve lançar NotFoundException se a banda não for encontrada ao criar transação', async () => {
      jest.spyOn(prisma.band, 'findUnique').mockResolvedValue(null);

      const dto: CreateTransactionDto = {
        description: 'Cachê',
        amount: 500,
        type: TransactionType.INCOME,
        date: '2026-07-28T00:00:00.000Z',
        bandId: 'band-inexistente',
        userId: 'user-uuid-1',
      };

      await expect(service.create(dto, mockUserPayload)).rejects.toThrow(NotFoundException);
    });

    it('deve lançar NotFoundException se o usuário não for encontrado ao criar transação', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      const dto: CreateTransactionDto = {
        description: 'Cachê',
        amount: 500,
        type: TransactionType.INCOME,
        date: '2026-07-28T00:00:00.000Z',
        bandId: 'band-uuid-1',
        userId: 'user-inexistente',
      };

      await expect(service.create(dto, mockUserPayload)).rejects.toThrow(NotFoundException);
    });

    it('deve lançar NotFoundException se o evento informado não for encontrado', async () => {
      jest.spyOn(prisma.event, 'findUnique').mockResolvedValue(null);

      const dto: CreateTransactionDto = {
        description: 'Cachê',
        amount: 500,
        type: TransactionType.INCOME,
        date: '2026-07-28T00:00:00.000Z',
        bandId: 'band-uuid-1',
        userId: 'user-uuid-1',
        eventId: 'event-inexistente',
      };

      await expect(service.create(dto, mockUserPayload)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('deve retornar transações das bandas do usuário sem filtros de query', async () => {
      const result = await service.findAll({}, mockUserPayload);

      expect(bandAccessService.getUserBandIds).toHaveBeenCalledWith(
        mockUserPayload.userId,
      );
      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: { bandId: { in: ['band-uuid-1'] } },
        orderBy: { date: 'desc' },
      });
      expect(result).toEqual([mockTransaction]);
    });

    it('deve filtrar transações por bandId, userId, eventId e type', async () => {
      const filters = {
        bandId: 'band-uuid-1',
        userId: 'user-uuid-1',
        eventId: 'event-uuid-1',
        type: TransactionType.INCOME,
      };

      const result = await service.findAll(filters, mockUserPayload);

      expect(bandAccessService.assertMembership).toHaveBeenCalledWith(
        mockUserPayload.userId,
        mockUserPayload.role,
        'band-uuid-1',
      );
      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: filters,
        orderBy: { date: 'desc' },
      });
      expect(result).toEqual([mockTransaction]);
    });
  });

  describe('findOne', () => {
    it('deve retornar uma transação pelo ID se ela existir e usuário for membro da banda', async () => {
      const result = await service.findOne('transaction-uuid-1', mockUserPayload);

      expect(prisma.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: 'transaction-uuid-1' },
      });
      expect(bandAccessService.assertMembership).toHaveBeenCalledWith(
        mockUserPayload.userId,
        mockUserPayload.role,
        mockTransaction.bandId,
      );
      expect(result).toEqual(mockTransaction);
    });

    it('deve lançar NotFoundException se a transação não existir', async () => {
      jest.spyOn(prisma.transaction, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne('id-inexistente', mockUserPayload)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar uma transação existente com sucesso', async () => {
      const updateDto: UpdateTransactionDto = {
        description: 'Nova Descrição',
        amount: 2000.0,
      };

      const updatedTransaction = { ...mockTransaction, ...updateDto };
      jest
        .spyOn(prisma.transaction, 'update')
        .mockResolvedValue(updatedTransaction);

      const result = await service.update('transaction-uuid-1', updateDto, mockUserPayload);

      expect(prisma.transaction.update).toHaveBeenCalled();
      expect(result.description).toBe('Nova Descrição');
    });

    it('deve lançar NotFoundException se tentar atualizar uma transação inexistente', async () => {
      jest.spyOn(prisma.transaction, 'findUnique').mockResolvedValue(null);

      await expect(
        service.update('id-inexistente', { description: 'Teste' }, mockUserPayload),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar NotFoundException se tentar atualizar com eventId inexistente', async () => {
      jest.spyOn(prisma.event, 'findUnique').mockResolvedValue(null);

      await expect(
        service.update('transaction-uuid-1', { eventId: 'event-inexistente' }, mockUserPayload),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve remover uma transação existente pelo ID', async () => {
      const result = await service.remove('transaction-uuid-1', mockUserPayload);

      expect(prisma.transaction.delete).toHaveBeenCalledWith({
        where: { id: 'transaction-uuid-1' },
      });
      expect(result).toEqual(mockTransaction);
    });

    it('deve lançar NotFoundException ao tentar remover uma transação inexistente', async () => {
      jest.spyOn(prisma.transaction, 'findUnique').mockResolvedValue(null);

      await expect(service.remove('id-inexistente', mockUserPayload)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

