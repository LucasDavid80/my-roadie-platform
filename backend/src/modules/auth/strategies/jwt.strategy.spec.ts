import { JwtStrategy } from './jwt.strategy';
import { Role } from '@prisma/client';

interface StrategyWithProvider {
  _secretOrKeyProvider: (
    req: unknown,
    rawJwtToken: unknown,
    done: (err: Error | null, secret?: string | Buffer) => void,
  ) => void;
}

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

  it('deve utilizar a role MUSICIAN como padrão caso role não esteja no payload', () => {
    const payload = {
      sub: 'user-uuid-456',
      email: 'musician@myroadie.br',
    };

    const result = strategy.validate(payload);
    expect(result).toEqual({
      userId: 'user-uuid-456',
      email: 'musician@myroadie.br',
      role: Role.MUSICIAN,
    });
  });

  describe('secretOrKeyProvider', () => {
    it('deve retornar a chave simétrica local (HS256) para tokens com alg: HS256', (done) => {
      const headerBase64 = Buffer.from(
        JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
      ).toString('base64url');
      const mockToken = `${headerBase64}.payload.signature`;

      const provider = (strategy as unknown as StrategyWithProvider)
        ._secretOrKeyProvider;
      provider(
        null,
        mockToken,
        (err: Error | null, secret?: string | Buffer) => {
          expect(err).toBeNull();
          expect(secret).toBe(
            process.env.JWT_SECRET || 'SECRET_KEY_MYROADIE_2026',
          );
          done();
        },
      );
    });

    it('deve resolver chave via JWKS para tokens com alg: ES256', (done) => {
      const headerBase64 = Buffer.from(
        JSON.stringify({ alg: 'ES256', typ: 'JWT' }),
      ).toString('base64url');
      const mockToken = `${headerBase64}.payload.signature`;

      const provider = (strategy as unknown as StrategyWithProvider)
        ._secretOrKeyProvider;
      provider(
        null,
        mockToken,
        (err: Error | null, secret?: string | Buffer) => {
          expect(err).toBeNull();
          expect(secret).toBeDefined();
          done();
        },
      );
    });

    it('deve realizar fallback seguro se a decodificação do cabeçalho falhar', (done) => {
      const mockToken = 'token-malformado-sem-pontos';

      const provider = (strategy as unknown as StrategyWithProvider)
        ._secretOrKeyProvider;
      provider(
        null,
        mockToken,
        (err: Error | null, secret?: string | Buffer) => {
          expect(err).toBeNull();
          expect(secret).toBeDefined();
          done();
        },
      );
    });
  });
});
