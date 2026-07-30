import { Test, TestingModule } from '@nestjs/testing';
import { RepertoireModule } from './repertoire.module';
import { RepertoireService } from './repertoire.service';
import { RepertoireController } from './repertoire.controller';
import { PrismaService } from '../../prisma/prisma.service';

describe('RepertoireModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [RepertoireModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();
  });

  it('deve compilar e disponibilizar RepertoireController e RepertoireService', () => {
    const controller = module.get<RepertoireController>(RepertoireController);
    const service = module.get<RepertoireService>(RepertoireService);

    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
