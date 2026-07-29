import { CreateEventDto } from './create-event.dto';
import { UpdateEventDto } from './update-event.dto';

describe('Events DTOs', () => {
  it('deve instanciar CreateEventDto', () => {
    const dto = new CreateEventDto();
    dto.title = 'Show Teste';
    dto.date = '2026-08-01';
    dto.location = 'São Paulo';
    expect(dto.title).toBe('Show Teste');
  });

  it('deve instanciar UpdateEventDto', () => {
    const dto = new UpdateEventDto();
    dto.title = 'Show Atualizado';
    expect(dto.title).toBe('Show Atualizado');
  });
});
