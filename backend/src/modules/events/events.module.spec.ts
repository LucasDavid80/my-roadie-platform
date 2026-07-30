import { Test } from '@nestjs/testing';
import { EventsModule } from './events.module';

describe('EventsModule', () => {
  it('deve compilar o EventsModule', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [EventsModule],
    }).compile();

    expect(moduleRef).toBeDefined();
  });
});
