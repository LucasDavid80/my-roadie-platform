import { Test } from '@nestjs/testing';
import { UsersModule } from './users.module';

describe('UsersModule', () => {
  it('deve compilar o UsersModule', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UsersModule],
    }).compile();

    expect(moduleRef).toBeDefined();
  });
});
