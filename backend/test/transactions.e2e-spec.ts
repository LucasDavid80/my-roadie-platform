import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { TransactionType, Role } from '@prisma/client';

describe('TransactionsController (e2e)', () => {
  const mockBandId = '11111111-1111-4111-8111-111111111111';
  const mockUserId = '22222222-2222-4222-8222-222222222222';
  const mockEventId = '33333333-3333-4333-8333-333333333333';
  const mockTransactionId = '44444444-4444-4444-8444-444444444444';

  const mockBand = { id: mockBandId, name: 'Banda Exemplo' };
  const mockUser = { id: mockUserId, name: 'Músico Exemplo' };
  const mockEvent = { id: mockEventId, title: 'Show de Exemplo' };

  const mockTransaction = {
    id: mockTransactionId,
    description: 'Cachê do show',
    amount: 1500.0,
    type: TransactionType.INCOME,
    date: new Date('2026-07-28T00:00:00.000Z').toISOString(),
    createdAt: new Date().toISOString(),
    bandId: mockBandId,
    userId: mockUserId,
    eventId: mockEventId,
  };

  const mockPrismaService = {
    band: {
      findUnique: jest
        .fn()
        .mockImplementation(({ where }: { where: { id: string } }) => {
          if (where.id === mockBandId) return Promise.resolve(mockBand);
          return Promise.resolve(null);
        }),
    },
    user: {
      findUnique: jest
        .fn()
        .mockImplementation(({ where }: { where: { id: string } }) => {
          if (where.id === mockUserId) return Promise.resolve(mockUser);
          return Promise.resolve(null);
        }),
    },
    event: {
      findUnique: jest
        .fn()
        .mockImplementation(({ where }: { where: { id: string } }) => {
          if (where.id === mockEventId) return Promise.resolve(mockEvent);
          return Promise.resolve(null);
        }),
    },
    bandMember: {
      findFirst: jest
        .fn()
        .mockImplementation(
          ({ where }: { where: { bandId?: string; userId?: string } }) => {
            if (where.bandId === mockBandId && where.userId === mockUserId) {
              return Promise.resolve({
                id: 'bm-1',
                bandId: mockBandId,
                userId: mockUserId,
              });
            }
            return Promise.resolve(null);
          },
        ),
      findMany: jest
        .fn()
        .mockImplementation(
          ({ where }: { where?: { userId?: string } } = {}) => {
            if (where && where.userId === mockUserId) {
              return Promise.resolve([
                { id: 'bm-1', bandId: mockBandId, userId: mockUserId },
              ]);
            }
            return Promise.resolve([]);
          },
        ),
    },
    transaction: {
      create: jest.fn().mockResolvedValue(mockTransaction),
      findMany: jest.fn().mockResolvedValue([mockTransaction]),
      findUnique: jest
        .fn()
        .mockImplementation(({ where }: { where: { id: string } }) => {
          if (where.id === mockTransactionId)
            return Promise.resolve(mockTransaction);
          return Promise.resolve(null);
        }),
      update: jest.fn().mockResolvedValue({
        ...mockTransaction,
        description: 'Cachê atualizado',
      }),
      delete: jest.fn().mockResolvedValue(mockTransaction),
    },
  };

  describe('Sem Autenticação (Guarda JWT ativa)', () => {
    let unauthApp: INestApplication<App>;

    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider(PrismaService)
        .useValue(mockPrismaService)
        .compile();

      unauthApp = moduleFixture.createNestApplication();
      await unauthApp.init();
    });

    afterAll(async () => {
      await unauthApp.close();
    });

    it('GET /transactions sem token deve retornar 401 Unauthorized', () => {
      return request(unauthApp.getHttpServer())
        .get('/transactions')
        .expect(401);
    });

    it('POST /transactions sem token deve retornar 401 Unauthorized', () => {
      return request(unauthApp.getHttpServer())
        .post('/transactions')
        .send({
          description: 'Cachê do show',
          amount: 1500.0,
          type: TransactionType.INCOME,
          date: '2026-07-28T00:00:00.000Z',
          bandId: mockBandId,
          userId: mockUserId,
        })
        .expect(401);
    });
  });

  describe('Com Autenticação (Guarda JWT simulada)', () => {
    let app: INestApplication<App>;

    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider(PrismaService)
        .useValue(mockPrismaService)
        .overrideGuard(JwtAuthGuard)
        .useValue({
          canActivate: (context: ExecutionContext) => {
            const req = context.switchToHttp().getRequest();
            req.user = {
              userId: mockUserId,
              email: 'test@example.com',
              role: Role.ADMIN,
            };
            return true;
          },
        })
        .compile();

      app = moduleFixture.createNestApplication();

      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );

      await app.init();
    });

    afterAll(async () => {
      await app.close();
    });

    describe('POST /transactions', () => {
      it('deve retornar 201 ao criar transação com payload válido', () => {
        return request(app.getHttpServer())
          .post('/transactions')
          .send({
            description: 'Cachê do show',
            amount: 1500.0,
            type: TransactionType.INCOME,
            date: '2026-07-28T00:00:00.000Z',
            bandId: mockBandId,
            userId: mockUserId,
            eventId: mockEventId,
          })
          .expect(201)
          .expect((res) => {
            const body = res.body as { id: string; description: string };
            expect(body).toHaveProperty('id', mockTransactionId);
            expect(body.description).toBe('Cachê do show');
          });
      });

      it('deve retornar 404 ao tentar criar transação para banda inexistente', () => {
        return request(app.getHttpServer())
          .post('/transactions')
          .send({
            description: 'Cachê',
            amount: 500,
            type: TransactionType.INCOME,
            date: '2026-07-28T00:00:00.000Z',
            bandId: '00000000-0000-4000-8000-000000000000',
            userId: mockUserId,
          })
          .expect(404);
      });

      it('deve retornar 400 ao enviar propriedade não permitida (forbidNonWhitelisted)', () => {
        return request(app.getHttpServer())
          .post('/transactions')
          .send({
            description: 'Cachê do show',
            amount: 1500.0,
            type: TransactionType.INCOME,
            date: '2026-07-28T00:00:00.000Z',
            bandId: mockBandId,
            userId: mockUserId,
            campoInvalido: 'teste',
          })
          .expect(400);
      });

      it('deve retornar 400 ao enviar tipo inválido no enum (validation error)', () => {
        return request(app.getHttpServer())
          .post('/transactions')
          .send({
            description: 'Cachê do show',
            amount: 1500.0,
            type: 'TIPO_INVALIDO',
            date: '2026-07-28T00:00:00.000Z',
            bandId: mockBandId,
            userId: mockUserId,
          })
          .expect(400);
      });
    });

    describe('GET /transactions', () => {
      it('deve retornar 200 com a lista de transações', () => {
        return request(app.getHttpServer())
          .get('/transactions')
          .expect(200)
          .expect((res) => {
            const body = res.body as unknown[];
            expect(Array.isArray(body)).toBe(true);
            expect(body.length).toBeGreaterThan(0);
          });
      });

      it('deve retornar 200 filtrando por query params', () => {
        return request(app.getHttpServer())
          .get(`/transactions?bandId=${mockBandId}&type=INCOME`)
          .expect(200)
          .expect((res) => {
            const body = res.body as { bandId: string; type: string }[];
            expect(Array.isArray(body)).toBe(true);
            expect(body[0].bandId).toBe(mockBandId);
            expect(body[0].type).toBe(TransactionType.INCOME);
          });
      });
    });

    describe('GET /transactions/:id', () => {
      it('deve retornar 200 com detalhes da transação por ID', () => {
        return request(app.getHttpServer())
          .get(`/transactions/${mockTransactionId}`)
          .expect(200)
          .expect((res) => {
            const body = res.body as { id: string };
            expect(body.id).toBe(mockTransactionId);
          });
      });

      it('deve retornar 404 se a transação não for encontrada', () => {
        return request(app.getHttpServer())
          .get('/transactions/00000000-0000-0000-0000-000000000000')
          .expect(404);
      });
    });

    describe('PATCH /transactions/:id', () => {
      it('deve retornar 200 ao atualizar uma transação com dados válidos', () => {
        return request(app.getHttpServer())
          .patch(`/transactions/${mockTransactionId}`)
          .send({
            description: 'Cachê atualizado',
          })
          .expect(200)
          .expect((res) => {
            const body = res.body as { description: string };
            expect(body.description).toBe('Cachê atualizado');
          });
      });

      it('deve retornar 404 ao tentar atualizar transação inexistente', () => {
        return request(app.getHttpServer())
          .patch('/transactions/00000000-0000-0000-0000-000000000000')
          .send({ description: 'Teste' })
          .expect(404);
      });

      it('deve retornar 400 ao tentar alterar campo não permitido no PATCH (forbidNonWhitelisted)', () => {
        return request(app.getHttpServer())
          .patch(`/transactions/${mockTransactionId}`)
          .send({ bandId: mockBandId })
          .expect(400);
      });
    });

    describe('DELETE /transactions/:id', () => {
      it('deve retornar 204 No Content ao remover transação com sucesso', () => {
        return request(app.getHttpServer())
          .delete(`/transactions/${mockTransactionId}`)
          .expect(204);
      });

      it('deve retornar 404 ao tentar remover transação inexistente', () => {
        return request(app.getHttpServer())
          .delete('/transactions/00000000-0000-0000-0000-000000000000')
          .expect(404);
      });
    });
  });
});
