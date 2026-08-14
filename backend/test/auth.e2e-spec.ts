import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthController & JwtAuthGuard (e2e)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;

  const mockUser = {
    id: 'user-uuid-123',
    email: 'musico@myroadie.br',
    name: 'Músico Teste',
    role: 'MUSICIAN',
    supabaseId: 'sb-musico-123',
  };

  const mockPrismaService = {
    user: {
      findUnique: jest
        .fn()
        .mockImplementation(
          ({ where }: { where: { id?: string; email?: string } }) => {
            if (where.email === mockUser.email || where.id === mockUser.id) {
              return Promise.resolve(mockUser);
            }
            return Promise.resolve(null);
          },
        ),
      findFirst: jest.fn().mockImplementation(
        ({
          where,
        }: {
          where?: {
            email?: string;
            OR?: Array<{ id?: string; supabaseId?: string; email?: string }>;
          };
        }) => {
          if (where?.email === mockUser.email) {
            return Promise.resolve(mockUser);
          }
          if (where?.OR && Array.isArray(where.OR)) {
            const matched = where.OR.some(
              (cond) =>
                cond.id === mockUser.id ||
                cond.email === mockUser.email ||
                cond.supabaseId === mockUser.supabaseId ||
                cond.supabaseId === mockUser.id,
            );
            if (matched) {
              return Promise.resolve(mockUser);
            }
          }
          return Promise.resolve(null);
        },
      ),
      create: jest
        .fn()
        .mockImplementation(({ data }: { data: Record<string, unknown> }) =>
          Promise.resolve({ id: 'uuid-new', ...data }),
        ),
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    jwtService = moduleFixture.get<JwtService>(JwtService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('deve autenticar com sucesso quando o e-mail existe', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'musico@myroadie.br' })
        .expect(200)
        .expect((res) => {
          const body = res.body as { access_token?: string; user?: unknown };
          expect(body).toHaveProperty('access_token');
          expect(body.user).toEqual({
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
            role: mockUser.role,
          });
        });
    });

    it('deve retornar 401 quando o e-mail não é encontrado', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'inexistente@myroadie.br' })
        .expect(401)
        .expect((res) => {
          const body = res.body as { message?: string };
          expect(body.message).toBe('Credenciais inválidas');
        });
    });
  });

  describe('Integração JwtAuthGuard em rota protegida (/users/:id)', () => {
    it('deve permitir acesso com um Bearer Token válido', async () => {
      const token = await jwtService.signAsync(
        { sub: mockUser.id, email: mockUser.email, role: mockUser.role },
        { secret: process.env.JWT_SECRET || 'SECRET_KEY_MYROADIE_2026' },
      );

      return request(app.getHttpServer())
        .get(`/users/${mockUser.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as { id?: string };
          expect(body).toHaveProperty('id', mockUser.id);
        });
    });

    it('deve retornar 401 (MISSING_BEARER) quando a requisição não possui cabeçalho Bearer', () => {
      return request(app.getHttpServer())
        .get(`/users/${mockUser.id}`)
        .expect(401)
        .expect((res) => {
          const body = res.body as { code?: string };
          expect(body.code).toBe('MISSING_BEARER');
        });
    });

    it('deve retornar 401 (MALFORMED_TOKEN) quando o token for malformado', () => {
      return request(app.getHttpServer())
        .get(`/users/${mockUser.id}`)
        .set('Authorization', 'Bearer token_invalido_qualquer')
        .expect(401)
        .expect((res) => {
          const body = res.body as { code?: string };
          expect(body.code).toBe('MALFORMED_TOKEN');
        });
    });

    it('deve retornar 401 (TOKEN_EXPIRED) quando o token estiver expirado', async () => {
      const expiredToken = await jwtService.signAsync(
        { sub: mockUser.id, email: mockUser.email, role: mockUser.role },
        {
          secret: process.env.JWT_SECRET || 'SECRET_KEY_MYROADIE_2026',
          expiresIn: '-1s',
        },
      );

      return request(app.getHttpServer())
        .get(`/users/${mockUser.id}`)
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401)
        .expect((res) => {
          const body = res.body as { code?: string };
          expect(body.code).toBe('TOKEN_EXPIRED');
        });
    });

    it('deve retornar 401 (INVALID_SIGNATURE) quando a assinatura do token for inválida', async () => {
      const tokenWrongSecret = await jwtService.signAsync(
        { sub: mockUser.id, email: mockUser.email, role: mockUser.role },
        { secret: 'CHAVE_ERRADA_123' },
      );

      return request(app.getHttpServer())
        .get(`/users/${mockUser.id}`)
        .set('Authorization', `Bearer ${tokenWrongSecret}`)
        .expect(401)
        .expect((res) => {
          const body = res.body as { code?: string };
          expect(body.code).toBe('INVALID_SIGNATURE');
        });
    });
  });
});
