import { Test, TestingModule } from '@nestjs/testing';
import { LegalController } from './legal.controller';
import { LegalService } from './legal.service';

describe('LegalController', () => {
  let controller: LegalController;
  let service: LegalService;

  const mockLegalService = {
    getCurrentVersion: jest.fn(() => ({
      version: 'v1.0.0',
      updatedAt: '2026-09-20T00:00:00Z',
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LegalController],
      providers: [
        {
          provide: LegalService,
          useValue: mockLegalService,
        },
      ],
    }).compile();

    controller = module.get<LegalController>(LegalController);
    service = module.get<LegalService>(LegalService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('getCurrentVersion', () => {
    it('deve chamar o service e retornar os dados corretos', () => {
      const result = controller.getCurrentVersion();
      expect(service.getCurrentVersion).toHaveBeenCalled();
      expect(result).toEqual({
        version: 'v1.0.0',
        updatedAt: '2026-09-20T00:00:00Z',
      });
    });
  });
});
