import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Role, TransactionType } from '@prisma/client';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let service: TransactionsService;

  const mockUserPayload: CurrentUserPayload = {
    userId: 'user-uuid-1',
    email: 'test@example.com',
    role: Role.MUSICIAN,
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

  const mockTransactionsService = {
    create: jest.fn().mockResolvedValue(mockTransaction),
    findAll: jest.fn().mockResolvedValue([mockTransaction]),
    findOne: jest.fn().mockResolvedValue(mockTransaction),
    update: jest.fn().mockResolvedValue(mockTransaction),
    remove: jest.fn().mockResolvedValue(mockTransaction),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TransactionsController>(TransactionsController);
    service = module.get<TransactionsService>(TransactionsService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve delegar a criação da transação ao TransactionsService', async () => {
      const dto: CreateTransactionDto = {
        description: 'Cachê do show',
        amount: 1500.0,
        type: TransactionType.INCOME,
        date: '2026-07-28T00:00:00.000Z',
        bandId: 'band-uuid-1',
        eventId: 'event-uuid-1',
      };

      const result = await controller.create(dto, mockUserPayload);

      expect(service.create).toHaveBeenCalledWith(dto, mockUserPayload);
      expect(result).toEqual(mockTransaction);
    });

    it('deve repassar NotFoundException se a banda não for encontrada no service', async () => {
      const dto: CreateTransactionDto = {
        description: 'Cachê',
        amount: 500,
        type: TransactionType.INCOME,
        date: '2026-07-28T00:00:00.000Z',
        bandId: 'band-inexistente',
      };

      jest
        .spyOn(service, 'create')
        .mockRejectedValueOnce(new NotFoundException('Banda não encontrada'));

      await expect(controller.create(dto, mockUserPayload)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar a lista de transações chamando o service sem filtros', async () => {
      const result = await controller.findAll(mockUserPayload);

      expect(service.findAll).toHaveBeenCalledWith(
        {
          bandId: undefined,
          userId: undefined,
          eventId: undefined,
          type: undefined,
        },
        mockUserPayload,
      );
      expect(result).toEqual([mockTransaction]);
    });

    it('deve passar os filtros ao service quando fornecidos via query', async () => {
      const result = await controller.findAll(
        mockUserPayload,
        'band-uuid-1',
        'user-uuid-1',
        'event-uuid-1',
        TransactionType.INCOME,
      );

      expect(service.findAll).toHaveBeenCalledWith(
        {
          bandId: 'band-uuid-1',
          userId: 'user-uuid-1',
          eventId: 'event-uuid-1',
          type: TransactionType.INCOME,
        },
        mockUserPayload,
      );
      expect(result).toEqual([mockTransaction]);
    });
  });

  describe('findOne', () => {
    it('deve retornar a transação pelo ID chamando o service', async () => {
      const result = await controller.findOne(
        'transaction-uuid-1',
        mockUserPayload,
      );

      expect(service.findOne).toHaveBeenCalledWith(
        'transaction-uuid-1',
        mockUserPayload,
      );
      expect(result).toEqual(mockTransaction);
    });

    it('deve repassar NotFoundException se a transação não for encontrada', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValueOnce(
          new NotFoundException('Transação não encontrada'),
        );

      await expect(
        controller.findOne('id-inexistente', mockUserPayload),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar a transação chamando o service com ID e DTO', async () => {
      const dto: UpdateTransactionDto = { description: 'Nova Descrição' };
      const updatedTransaction = {
        ...mockTransaction,
        description: 'Nova Descrição',
      };

      jest.spyOn(service, 'update').mockResolvedValueOnce(updatedTransaction);

      const result = await controller.update(
        'transaction-uuid-1',
        dto,
        mockUserPayload,
      );

      expect(service.update).toHaveBeenCalledWith(
        'transaction-uuid-1',
        dto,
        mockUserPayload,
      );
      expect(result.description).toBe('Nova Descrição');
    });

    it('deve repassar NotFoundException se a transação a ser atualizada não for encontrada', async () => {
      jest
        .spyOn(service, 'update')
        .mockRejectedValueOnce(
          new NotFoundException('Transação não encontrada'),
        );

      await expect(
        controller.update(
          'id-inexistente',
          { description: 'Teste' },
          mockUserPayload,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve remover a transação chamando o service com o ID', async () => {
      const result = await controller.remove(
        'transaction-uuid-1',
        mockUserPayload,
      );

      expect(service.remove).toHaveBeenCalledWith(
        'transaction-uuid-1',
        mockUserPayload,
      );
      expect(result).toEqual(mockTransaction);
    });

    it('deve repassar NotFoundException se a transação a ser removida não existir', async () => {
      jest
        .spyOn(service, 'remove')
        .mockRejectedValueOnce(
          new NotFoundException('Transação não encontrada'),
        );

      await expect(
        controller.remove('id-inexistente', mockUserPayload),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
