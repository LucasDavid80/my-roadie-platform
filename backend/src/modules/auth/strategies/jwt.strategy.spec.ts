import { JwtStrategy } from './jwt.strategy';
import { Role } from '@prisma/client';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    strategy = new JwtStrategy();
  });

  it('deve estar definido', () => {
    expect(strategy).toBeDefined();
  });

  it('deve validar o payload e retornar userId, email e role', () => {
    const payload = {
      sub: 'user-uuid-123',
      email: 'test@myroadie.br',
      role: Role.ROADIE,
    };

    const result = strategy.validate(payload);
    expect(result).toEqual({
      userId: 'user-uuid-123',
      email: 'test@myroadie.br',
      role: Role.ROADIE,
    });
  });
});
