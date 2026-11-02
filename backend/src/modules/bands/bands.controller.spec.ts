import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { BandsController } from './bands.controller';
import { BandsService } from './bands.service';
import { CreateBandDto } from './dto/create-band.dto';
import { UpdateBandDto } from './dto/update-band.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

describe('BandsController', () => {
  let controller: BandsController;
  let service: BandsService;

  const mockUser: CurrentUserPayload = {
    userId: 'user-uuid-1',
    email: 'user@example.com',
    role: Role.MUSICIAN,
  };

  const mockBand = {
    id: 'band-uuid-1',
    name: 'Banda Exemplo',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBandsService = {
    create: jest.fn().mockResolvedValue(mockBand),
    findAll: jest.fn().mockResolvedValue([mockBand]),
    findOne: jest.fn().mockResolvedValue(mockBand),
    update: jest.fn().mockResolvedValue(mockBand),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BandsController],
      providers: [
        {
          provide: BandsService,
          useValue: mockBandsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BandsController>(BandsController);
    service = module.get<BandsService>(BandsService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve delegar a criação da banda ao BandsService', async () => {
      const dto: CreateBandDto = { name: 'Banda Exemplo' };

      const result = await controller.create(dto, mockUser);

      expect(service.create).toHaveBeenCalledWith(dto, mockUser);
      expect(result).toEqual(mockBand);
    });
  });

  describe('findAll', () => {
    it('deve delegar a listagem das bandas ao BandsService', async () => {
      const result = await controller.findAll(mockUser);

      expect(service.findAll).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual([mockBand]);
    });
  });

  describe('findOne', () => {
    it('deve delegar a busca da banda ao BandsService', async () => {
      const result = await controller.findOne('band-uuid-1', mockUser);

      expect(service.findOne).toHaveBeenCalledWith('band-uuid-1', mockUser);
      expect(result).toEqual(mockBand);
    });
  });

  describe('update', () => {
    it('deve delegar a atualização da banda ao BandsService', async () => {
      const dto: UpdateBandDto = { name: 'Banda Atualizada' };

      const result = await controller.update('band-uuid-1', dto, mockUser);

      expect(service.update).toHaveBeenCalledWith(
        'band-uuid-1',
        dto,
        mockUser,
      );
      expect(result).toEqual(mockBand);
    });
  });

  describe('remove', () => {
    it('deve delegar a exclusão da banda ao BandsService', async () => {
      await controller.remove('band-uuid-1', mockUser);

      expect(service.remove).toHaveBeenCalledWith('band-uuid-1', mockUser);
    });
  });
});
