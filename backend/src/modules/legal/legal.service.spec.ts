import { Test, TestingModule } from '@nestjs/testing';
import { LegalService } from './legal.service';

describe('LegalService', () => {
  let service: LegalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LegalService],
    }).compile();

    service = module.get<LegalService>(LegalService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('getCurrentVersion', () => {
    it('deve retornar a versão e data de atualização', () => {
      const result = service.getCurrentVersion();
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('updatedAt');
      expect(result.version).toBe('v1.0.0');
    });
  });
});
