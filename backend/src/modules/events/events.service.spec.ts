import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  Band,
  EventStatus,
  Prisma,
  Role,
  Transaction,
  TransactionType,
  User,
} from '@prisma/client';
import { EventsService } from './events.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BandAccessService } from '../band-access/band-access.service';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

describe('EventsService', () => {
  let service: EventsService;
  let prisma: PrismaService;
  let bandAccessService: BandAccessService;

  const mockUser: CurrentUserPayload = {
    userId: 'user-uuid-1',
    email: 'musician@example.com',
    role: Role.MUSICIAN,
  };

  const mockAdminUser: CurrentUserPayload = {
    userId: 'admin-uuid-1',
    email: 'admin@example.com',
    role: Role.ADMIN,
  };

  const mockNonMemberUser: CurrentUserPayload = {
    userId: 'non-member-uuid',
    email: 'stranger@example.com',
    role: Role.MUSICIAN,
  };

  const mockBand = {
    id: 'band-uuid-1',
    name: 'Os Mutantes',
  };

  const mockEvent = {
    id: 'event-uuid-123',
    title: 'Show no Festival de Verão',
    startsAt: new Date('2026-10-15T20:00:00.000Z'),
    endsAt: new Date('2026-10-15T22:00:00.000Z'),
    timezone: 'America/Sao_Paulo',

    type: 'Show',
    fee: new Prisma.Decimal(1500),
    location: 'Concha Acústica',
    description: 'Apresentação principal do festival',
    status: EventStatus.PENDING,
    bandId: 'band-uuid-1',
    createdById: 'user-uuid-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    tasks: [],
  };

  const mockTransaction: Transaction = {
    id: 'tx-uuid-1',
    description: 'Cachê - Show no Festival de Verão',
    amount: new Prisma.Decimal(1500),
    type: TransactionType.INCOME,
    startsAt: new Date('2026-10-15T20:00:00.000Z'),
    endsAt: new Date('2026-10-15T22:00:00.000Z'),
    timezone: 'America/Sao_Paulo',
    bandId: 'band-uuid-1',
    userId: 'user-uuid-1',
    eventId: 'event-uuid-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBandAccessService = {
    assertMembership: jest.fn().mockResolvedValue(undefined),
    getUserBandIds: jest.fn().mockResolvedValue(['band-uuid-1']),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: PrismaService,
          useValue: {
            band: {
              findUnique: jest.fn().mockResolvedValue(mockBand),
              create: jest.fn().mockResolvedValue(mockBand),
            },
            user: {
              findUnique: jest.fn().mockResolvedValue({
                id: 'user-uuid-1',
                name: 'Lucas Musician',
              }),
              findFirst: jest.fn().mockResolvedValue({
                id: 'user-uuid-1',
                name: 'Lucas Musician',
              }),
              create: jest.fn().mockResolvedValue({
                id: 'user-uuid-new',
                name: '',
              }),
            },
            event: {
              create: jest.fn().mockResolvedValue(mockEvent),
              findMany: jest.fn().mockResolvedValue([mockEvent]),
              findUnique: jest.fn().mockResolvedValue(mockEvent),
              update: jest.fn().mockResolvedValue(mockEvent),
              delete: jest.fn().mockResolvedValue(mockEvent),
            },
            transaction: {
              create: jest.fn().mockResolvedValue(mockTransaction),
              findFirst: jest.fn().mockResolvedValue(null),
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

    service = module.get<EventsService>(EventsService);
    prisma = module.get<PrismaService>(PrismaService);
    bandAccessService = module.get<BandAccessService>(BandAccessService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um novo evento com sucesso quando o usuário for membro da banda', async () => {
      const dto: CreateEventDto = {
        title: 'Show no Festival de Verão',
        startsAt: '2026-10-15T20:00:00.000Z',
        timezone: 'America/Sao_Paulo',
        location: 'Concha Acústica',
        description: 'Apresentação principal do festival',
        bandId: 'band-uuid-1',
        status: EventStatus.PENDING,
      };

      const result = await service.create(dto, mockUser);

      expect(bandAccessService.assertMembership).toHaveBeenCalledWith(
        mockUser.userId,
        mockUser.role,
        dto.bandId,
      );
      expect(prisma.band.findUnique).toHaveBeenCalledWith({
        where: { id: dto.bandId },
      });
      expect(prisma.event.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          startsAt: new Date(dto.startsAt),
          endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
          timezone: dto.timezone || 'America/Sao_Paulo',
          location: dto.location,
          description: dto.description,

          type: undefined,
          fee: undefined,
          status: EventStatus.PENDING,
          bandId: dto.bandId,
          createdById: mockUser.userId,
        },
        include: {
          tasks: true,
        },
      });
      expect(result).toEqual(mockEvent);
    });

    it('deve persistir startsAt, endsAt, type, fee e criar uma Transaction do tipo INCOME quando fee > 0', async () => {
      const dto: CreateEventDto = {
        title: 'Show com Cachê',
        startsAt: '2026-10-15T20:00:00.000Z',
        timezone: 'America/Sao_Paulo',
        location: 'Concha Acústica',
        bandId: 'band-uuid-1',

        type: 'Show',
        endsAt: '2026-10-15T22:00:00.000Z',
        fee: 2000,
      };

      const eventWithFee: Prisma.EventGetPayload<{ include: { tasks: true } }> =
        {
          ...mockEvent,
          title: 'Show com Cachê',

          type: 'Show',
          fee: new Prisma.Decimal(2000),
        };
      jest.spyOn(prisma.event, 'create').mockResolvedValueOnce(eventWithFee);

      const result = await service.create(dto, mockUser);

      expect(prisma.event.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          startsAt: new Date(dto.startsAt),
          endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
          timezone: dto.timezone || 'America/Sao_Paulo',
          location: dto.location,
          description: undefined,

          type: 'Show',
          fee: new Prisma.Decimal(2000),
          status: EventStatus.PENDING,
          bandId: dto.bandId,
          createdById: mockUser.userId,
        },
        include: {
          tasks: true,
        },
      });
      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: {
          description: 'Cachê - Show com Cachê',
          amount: new Prisma.Decimal(2000),
          type: TransactionType.INCOME,
          date: eventWithFee.startsAt,
          bandId: 'band-uuid-1',
          userId: mockUser.userId,
          eventId: eventWithFee.id,
        },
      });
      expect(result).toEqual(eventWithFee);
    });

    it('deve lançar ForbiddenException se o usuário não pertencer à banda do evento', async () => {
      jest
        .spyOn(bandAccessService, 'assertMembership')
        .mockRejectedValueOnce(
          new ForbiddenException(
            'Você não tem permissão para acessar os recursos desta banda',
          ),
        );

      const dto: CreateEventDto = {
        title: 'Show Proibido',
        startsAt: '2026-10-15T20:00:00.000Z',
        timezone: 'America/Sao_Paulo',
        location: 'Local',
        bandId: 'band-uuid-1',
      };

      await expect(service.create(dto, mockNonMemberUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('deve lançar NotFoundException se a banda especificada não existir', async () => {
      jest.spyOn(prisma.band, 'findUnique').mockResolvedValueOnce(null);

      const dto: CreateEventDto = {
        title: 'Show Sem Banda',
        startsAt: '2026-10-15T20:00:00.000Z',
        timezone: 'America/Sao_Paulo',
        location: 'Local',
        bandId: 'band-inexistente',
      };

      await expect(service.create(dto, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve criar evento associando à primeira banda do usuário quando bandId não for informado e o usuário possuir banda', async () => {
      jest
        .spyOn(bandAccessService, 'getUserBandIds')
        .mockResolvedValueOnce(['band-uuid-1']);

      const dto: CreateEventDto = {
        title: 'Show Solo com Banda Pré-existente',
        startsAt: '2026-10-15T20:00:00.000Z',
        timezone: 'America/Sao_Paulo',
        location: 'Auditório',
      };

      const result = await service.create(dto, mockUser);

      expect(bandAccessService.getUserBandIds).toHaveBeenCalledWith(
        mockUser.userId,
      );
      expect(prisma.event.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          startsAt: new Date(dto.startsAt),
          endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
          timezone: dto.timezone || 'America/Sao_Paulo',
          location: dto.location,
          description: undefined,

          type: undefined,
          fee: undefined,
          status: EventStatus.PENDING,
          bandId: 'band-uuid-1',
          createdById: mockUser.userId,
        },
        include: {
          tasks: true,
        },
      });
      expect(result).toEqual(mockEvent);
    });

    it('deve auto-provisionar nova banda solo padrão e criar evento quando bandId não for informado e o usuário não tiver banda', async () => {
      jest.spyOn(bandAccessService, 'getUserBandIds').mockResolvedValueOnce([]);

      const autoCreatedBand: Band = {
        id: 'band-auto-created-uuid',
        name: 'Projeto Solo - Lucas Musician',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockFoundUser: User = {
        id: 'user-uuid-1',
        name: 'Lucas Musician',
        email: 'musician@example.com',
        supabaseId: 'user-uuid-1',
        role: Role.MUSICIAN,
        experience: null,
        phone: null,
        instagram: null,
        city: null,
        minCache: null,
        youtubeUrl: null,
        bio: null,
        instruments: [],
        styles: [],
        availability: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.user, 'findFirst').mockResolvedValueOnce(mockFoundUser);
      jest.spyOn(prisma.band, 'create').mockResolvedValueOnce(autoCreatedBand);

      const dto: CreateEventDto = {
        title: 'Primeiro Show Solo',
        startsAt: '2026-10-15T20:00:00.000Z',
        timezone: 'America/Sao_Paulo',
        location: 'Teatro Municipal',
      };

      const result = await service.create(dto, mockUser);

      expect(bandAccessService.getUserBandIds).toHaveBeenCalledWith(
        mockUser.userId,
      );
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { id: mockUser.userId },
            { supabaseId: mockUser.userId },
            { email: mockUser.email },
          ],
        },
      });
      expect(prisma.band.create).toHaveBeenCalledWith({
        data: {
          name: 'Projeto Solo - Lucas Musician',
          members: {
            create: {
              userId: mockUser.userId,
            },
          },
        },
      });
      expect(prisma.event.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          startsAt: new Date(dto.startsAt),
          endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
          timezone: dto.timezone || 'America/Sao_Paulo',
          location: dto.location,
          description: undefined,

          type: undefined,
          fee: undefined,
          status: EventStatus.PENDING,
          bandId: 'band-auto-created-uuid',
          createdById: mockUser.userId,
        },
        include: {
          tasks: true,
        },
      });
      expect(result).toEqual(mockEvent);
    });

    it('deve criar o usuário no banco caso não seja encontrado (resolveDbUser)', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValueOnce(null);
      const newUser = { id: 'user-uuid-new', name: '' };
      jest
        .spyOn(prisma.user, 'create')
        .mockResolvedValueOnce(newUser as unknown as User);
      jest.spyOn(bandAccessService, 'getUserBandIds').mockResolvedValueOnce([]);

      const dto: CreateEventDto = {
        title: 'Show no Festival',
        startsAt: '2026-10-15T20:00:00.000Z',
        timezone: 'America/Sao_Paulo',
        location: 'Concha Acústica',
      };

      await service.create(dto, { ...mockUser, email: null });

      expect(prisma.user.create).toHaveBeenCalledWith({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: expect.objectContaining({
          supabaseId: mockUser.userId,
          email: `${mockUser.userId}@supabase.user`,
        }),
      });
    });
  });

  describe('findAll', () => {
    it('deve retornar eventos filtrados pelas bandas do usuário quando nenhum bandId for informado', async () => {
      const result = await service.findAll(mockUser);

      expect(bandAccessService.getUserBandIds).toHaveBeenCalledWith(
        mockUser.userId,
      );
      expect(prisma.event.findMany).toHaveBeenCalledWith({
        where: { bandId: { in: ['band-uuid-1'] } },
        include: { tasks: true },
        orderBy: { startsAt: 'asc' },
      });
      expect(result).toEqual([mockEvent]);
    });

    it('deve retornar eventos filtrados por bandId específico e checar permissão', async () => {
      const result = await service.findAll(mockUser, 'band-uuid-1');

      expect(bandAccessService.assertMembership).toHaveBeenCalledWith(
        mockUser.userId,
        mockUser.role,
        'band-uuid-1',
      );
      expect(prisma.event.findMany).toHaveBeenCalledWith({
        where: { bandId: 'band-uuid-1' },
        include: { tasks: true },
        orderBy: { startsAt: 'asc' },
      });
      expect(result).toEqual([mockEvent]);
    });

    it('deve retornar todos os eventos sem restrição de banda quando o usuário for ADMIN', async () => {
      const result = await service.findAll(mockAdminUser);

      expect(prisma.event.findMany).toHaveBeenCalledWith({
        include: { tasks: true },
        orderBy: { startsAt: 'asc' },
      });
      expect(result).toEqual([mockEvent]);
    });
  });

  describe('findOne', () => {
    it('deve retornar o evento existente quando o usuário for membro da banda', async () => {
      const result = await service.findOne('event-uuid-123', mockUser);

      expect(prisma.event.findUnique).toHaveBeenCalledWith({
        where: { id: 'event-uuid-123' },
        include: {
          tasks: true,
          band: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });
      expect(bandAccessService.assertMembership).toHaveBeenCalledWith(
        mockUser.userId,
        mockUser.role,
        mockEvent.bandId,
      );
      expect(result).toEqual(mockEvent);
    });

    it('deve lançar NotFoundException se o evento não existir', async () => {
      jest.spyOn(prisma.event, 'findUnique').mockResolvedValueOnce(null);

      await expect(service.findOne('id-inexistente', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar ForbiddenException se não for membro da banda do evento encontrado', async () => {
      jest
        .spyOn(bandAccessService, 'assertMembership')
        .mockRejectedValueOnce(
          new ForbiddenException(
            'Você não tem permissão para acessar os recursos desta banda',
          ),
        );

      await expect(
        service.findOne('event-uuid-123', mockNonMemberUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('deve atualizar o evento quando o usuário for membro', async () => {
      const updateDto: UpdateEventDto = {
        title: 'Show Festival Atualizado',
        status: EventStatus.CONFIRMED,
      };
      const updatedEvent = { ...mockEvent, ...updateDto };
      jest.spyOn(prisma.event, 'update').mockResolvedValueOnce(updatedEvent);

      const result = await service.update(
        'event-uuid-123',
        updateDto,
        mockUser,
      );

      expect(prisma.event.update).toHaveBeenCalledWith({
        where: { id: 'event-uuid-123' },
        data: {
          title: 'Show Festival Atualizado',
          status: EventStatus.CONFIRMED,
        },
        include: {
          tasks: true,
        },
      });
      expect(result.title).toBe('Show Festival Atualizado');
    });

    it('deve sincronizar a transação vinculada atualizando amount quando fee for alterado e fee > 0', async () => {
      const existingTx: Transaction = {
        id: 'tx-uuid-1',
        description: 'Cachê - Show no Festival de Verão',
        amount: new Prisma.Decimal(1000),
        type: TransactionType.INCOME,
        startsAt: new Date('2026-10-15T20:00:00.000Z'),
        endsAt: new Date('2026-10-15T22:00:00.000Z'),
        timezone: 'America/Sao_Paulo',
        userId: mockUser.userId,
        bandId: mockEvent.bandId,
        eventId: mockEvent.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(prisma.transaction, 'findFirst')
        .mockResolvedValueOnce(existingTx);

      const updateDto: UpdateEventDto = {
        fee: 2500,
      };

      await service.update('event-uuid-123', updateDto, mockUser);

      expect(prisma.transaction.update).toHaveBeenCalledWith({
        where: { id: 'tx-uuid-1' },
        data: {
          amount: new Prisma.Decimal(2500),
          description: `Cachê - ${mockEvent.title}`,
          date: mockEvent.startsAt,
          band: { connect: { id: mockEvent.bandId } },
        },
      });
    });

    it('deve criar uma nova transação no update se fee > 0 e não existia transação prévia', async () => {
      jest.spyOn(prisma.transaction, 'findFirst').mockResolvedValueOnce(null);

      const updateDto: UpdateEventDto = {
        fee: 1800,
      };

      await service.update('event-uuid-123', updateDto, mockUser);

      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: {
          description: `Cachê - ${mockEvent.title}`,
          amount: new Prisma.Decimal(1800),
          type: TransactionType.INCOME,
          date: mockEvent.startsAt,
          bandId: mockEvent.bandId,
          userId: mockUser.userId,
          eventId: mockEvent.id,
        },
      });
    });

    it('deve remover a transação vinculada quando fee for zerado ou nulo', async () => {
      const existingTx: Transaction = {
        id: 'tx-uuid-1',
        description: 'Cachê - Show no Festival de Verão',
        amount: new Prisma.Decimal(1000),
        type: TransactionType.INCOME,
        startsAt: new Date('2026-10-15T20:00:00.000Z'),
        endsAt: new Date('2026-10-15T22:00:00.000Z'),
        timezone: 'America/Sao_Paulo',
        userId: mockUser.userId,
        bandId: mockEvent.bandId,
        eventId: mockEvent.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(prisma.transaction, 'findFirst')
        .mockResolvedValueOnce(existingTx);

      const updateDto: UpdateEventDto = {
        fee: 0,
      };

      await service.update('event-uuid-123', updateDto, mockUser);

      expect(prisma.transaction.delete).toHaveBeenCalledWith({
        where: { id: 'tx-uuid-1' },
      });
    });

    it('deve atualizar a descrição da transação vinculada se o título do evento for alterado', async () => {
      const existingTx: Transaction = {
        id: 'tx-uuid-1',
        description: 'Cachê - Show no Festival de Verão',
        amount: new Prisma.Decimal(1000),
        type: TransactionType.INCOME,
        startsAt: new Date('2026-10-15T20:00:00.000Z'),
        endsAt: new Date('2026-10-15T22:00:00.000Z'),
        timezone: 'America/Sao_Paulo',
        userId: mockUser.userId,
        bandId: mockEvent.bandId,
        eventId: mockEvent.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(prisma.transaction, 'findFirst')
        .mockResolvedValueOnce(existingTx);

      const updateDto: UpdateEventDto = {
        title: 'Novo Título do Show',
      };

      await service.update('event-uuid-123', updateDto, mockUser);

      expect(prisma.transaction.update).toHaveBeenCalledWith({
        where: { id: 'tx-uuid-1' },
        data: {
          description: 'Cachê - Show no Festival de Verão',
        },
      });
    });

    it('deve atualizar startsAt, endsAt, timezone, location, description, type', async () => {
      const updateDto: UpdateEventDto = {
        startsAt: '2026-10-15T21:00:00.000Z',
        endsAt: '2026-10-15T23:00:00.000Z',
        timezone: 'America/Sao_Paulo',
        location: 'Novo Local',
        description: 'Nova Descrição',
        type: 'Ensaio',
      };

      await service.update('event-uuid-123', updateDto, mockUser);

      expect(prisma.event.update).toHaveBeenCalledWith({
        where: { id: 'event-uuid-123' },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: expect.objectContaining({
          startsAt: new Date(updateDto.startsAt!),
          endsAt: new Date(updateDto.endsAt!),
          timezone: updateDto.timezone,
          location: updateDto.location,
          description: updateDto.description,
          type: updateDto.type,
        }),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        include: expect.any(Object),
      });
    });

    it('deve atualizar transaction data (date e band) se startsAt ou bandId mudarem e fee não mudar', async () => {
      const existingTx: Transaction = {
        id: 'tx-uuid-1',
        description: 'Cachê',
        amount: new Prisma.Decimal(1000),
        type: TransactionType.INCOME,
        startsAt: new Date('2026-10-15T20:00:00.000Z'),
        endsAt: null,
        timezone: 'America/Sao_Paulo',
        userId: mockUser.userId,
        bandId: mockEvent.bandId,
        eventId: mockEvent.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(prisma.transaction, 'findFirst')
        .mockResolvedValueOnce(existingTx);

      const updateDto: UpdateEventDto = {
        startsAt: '2026-11-15T20:00:00.000Z',
        bandId: 'band-uuid-nova',
      };

      const updatedEvent = {
        ...mockEvent,
        startsAt: new Date(updateDto.startsAt!),
        bandId: updateDto.bandId!,
      };
      jest.spyOn(prisma.event, 'update').mockResolvedValueOnce(updatedEvent);

      await service.update('event-uuid-123', updateDto, mockUser);

      expect(prisma.transaction.update).toHaveBeenCalledWith({
        where: { id: 'tx-uuid-1' },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: expect.objectContaining({
          date: updatedEvent.startsAt,
          band: { connect: { id: updateDto.bandId } },
        }),
      });
    });

    it('deve validar nova banda caso bandId seja alterado no update', async () => {
      const updateDto: UpdateEventDto = {
        bandId: 'band-uuid-nova',
      };

      await service.update('event-uuid-123', updateDto, mockUser);

      expect(bandAccessService.assertMembership).toHaveBeenCalledWith(
        mockUser.userId,
        mockUser.role,
        'band-uuid-nova',
      );
      expect(prisma.band.findUnique).toHaveBeenCalledWith({
        where: { id: 'band-uuid-nova' },
      });
    });

    it('deve lançar NotFoundException se a nova banda não existir no update', async () => {
      jest.spyOn(prisma.band, 'findUnique').mockResolvedValueOnce(null);

      const updateDto: UpdateEventDto = {
        bandId: 'band-inexistente',
      };

      await expect(
        service.update('event-uuid-123', updateDto, mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve remover o evento pelo ID quando o usuário for membro da banda', async () => {
      const result = await service.remove('event-uuid-123', mockUser);

      expect(prisma.event.delete).toHaveBeenCalledWith({
        where: { id: 'event-uuid-123' },
      });
      expect(result).toEqual(mockEvent);
    });

    it('deve lançar NotFoundException se o evento a ser removido não existir', async () => {
      jest.spyOn(prisma.event, 'findUnique').mockResolvedValueOnce(null);

      await expect(service.remove('id-inexistente', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
