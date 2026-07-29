import { Test } from '@nestjs/testing';
import { TasksModule } from './tasks.module';

describe('TasksModule', () => {
  it('deve compilar o TasksModule', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TasksModule],
    }).compile();

    expect(moduleRef).toBeDefined();
  });
});
