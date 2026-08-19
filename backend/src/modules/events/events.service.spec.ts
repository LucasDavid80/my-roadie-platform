import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { EventStatus, Role } from '@prisma/client';
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
    date: new Date('2026-10-15T20:00:00.000Z'),
    location: 'Concha Acústica',
    description: 'Apresentação principal do festival',
    status: EventStatus.PENDING,
    bandId: 'band-uuid-1',
    createdById: 'user-uuid-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    tasks: [],
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
              findUnique: jest
                .fn()
                .mockResolvedValue({ id: 'user-uuid-1', name: 'Lucas Musician' }),
              findFirst: jest
                .fn()
                .mockResolvedValue({ id: 'user-uuid-1', name: 'Lucas Musician' }),
            },
            event: {
              create: jest.fn().mockResolvedValue(mockEvent),
              findMany: jest.fn().mockResolvedValue([mockEvent]),
              findUnique: jest.fn().mockResolvedValue(mockEvent),
              update: jest.fn().mockResolvedValue(mockEvent),
              delete: jest.fn().mockResolvedValue(mockEvent),
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
        date: '2026-10-15T20:00:00.000Z',
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
          date: new Date(dto.date),
          location: dto.location,
          description: dto.description,
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
        date: '2026-10-15T20:00:00.000Z',
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
        date: '2026-10-15T20:00:00.000Z',
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
        date: '2026-10-15T20:00:00.000Z',
        location: 'Auditório',
      };

      const result = await service.create(dto, mockUser);

      expect(bandAccessService.getUserBandIds).toHaveBeenCalledWith(
        mockUser.userId,
      );
      expect(prisma.event.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          date: new Date(dto.date),
          location: dto.location,
          description: undefined,
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
      jest
        .spyOn(bandAccessService, 'getUserBandIds')
        .mockResolvedValueOnce([]);

      const autoCreatedBand = {
        id: 'band-auto-created-uuid',
        name: 'Projeto Solo - Lucas Musician',
      };

      jest
        .spyOn(prisma.user, 'findFirst')
        .mockResolvedValueOnce({ id: 'user-uuid-1', name: 'Lucas Musician' } as any);
      jest
        .spyOn(prisma.band, 'create')
        .mockResolvedValueOnce(autoCreatedBand as any);

      const dto: CreateEventDto = {
        title: 'Primeiro Show Solo',
        date: '2026-10-15T20:00:00.000Z',
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
          date: new Date(dto.date),
          location: dto.location,
          description: undefined,
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
        orderBy: { date: 'asc' },
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
        orderBy: { date: 'asc' },
      });
      expect(result).toEqual([mockEvent]);
    });

    it('deve retornar todos os eventos sem restrição de banda quando o usuário for ADMIN', async () => {
      const result = await service.findAll(mockAdminUser);

      expect(prisma.event.findMany).toHaveBeenCalledWith({
        include: { tasks: true },
        orderBy: { date: 'asc' },
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
