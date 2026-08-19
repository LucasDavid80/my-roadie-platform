import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { CurrentUserPayload } from '../src/modules/auth/decorators/current-user.decorator';

describe('EventsController (e2e)', () => {
  const mockBandId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  const mockEventId = 'b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a22';

  const mockBand = {
    id: mockBandId,
    name: 'Os Mutantes',
  };

  const mockEvent = {
    id: mockEventId,
    title: 'Show no Festival de Verão',
    date: new Date('2026-10-15T20:00:00.000Z').toISOString(),
    startTime: '19:30',
    endTime: '22:00',
    type: 'Show',
    fee: 1500,
    location: 'Concha Acústica',
    description: 'Apresentação principal do festival',
    status: 'PENDING',
    bandId: mockBandId,
    createdById: 'user-uuid-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tasks: [],
  };

  const mockPrismaService = {
    band: {
      findUnique: jest
        .fn()
        .mockImplementation(({ where }: { where: { id: string } }) => {
          if (where.id === mockBandId) return Promise.resolve(mockBand);
          return Promise.resolve(null);
        }),
      create: jest
        .fn()
        .mockImplementation(({ data }: { data: { name: string } }) =>
          Promise.resolve({ id: 'auto-band-uuid', name: data.name }),
        ),
    },
    user: {
      findUnique: jest.fn().mockResolvedValue({ id: 'user-uuid-1', name: 'Admin User' }),
      findFirst: jest.fn().mockResolvedValue({ id: 'user-uuid-1', name: 'Admin User' }),
      create: jest.fn().mockResolvedValue({ id: 'user-uuid-1', name: 'Admin User' }),
    },
    bandMember: {
      findFirst: jest
        .fn()
        .mockImplementation(
          ({ where }: { where: { bandId?: string; userId?: string } }) => {
            if (where.bandId === mockBandId && where.userId === 'user-uuid-1') {
              return Promise.resolve({
                id: 'bm-1',
                bandId: mockBandId,
                userId: 'user-uuid-1',
              });
            }
            return Promise.resolve(null);
          },
        ),
      findMany: jest
        .fn()
        .mockImplementation(
          ({ where }: { where?: { userId?: string } } = {}) => {
            if (where && where.userId === 'user-uuid-1') {
              return Promise.resolve([
                { id: 'bm-1', bandId: mockBandId, userId: 'user-uuid-1' },
              ]);
            }
            return Promise.resolve([]);
          },
        ),
    },
    event: {
      create: jest.fn().mockResolvedValue(mockEvent),
      findMany: jest.fn().mockResolvedValue([mockEvent]),
      findUnique: jest
        .fn()
        .mockImplementation(({ where }: { where: { id: string } }) => {
          if (where.id === mockEventId) return Promise.resolve(mockEvent);
          return Promise.resolve(null);
        }),
      update: jest.fn().mockResolvedValue({
        ...mockEvent,
        title: 'Show Atualizado',
      }),
      delete: jest.fn().mockResolvedValue(mockEvent),
    },
    transaction: {
      create: jest.fn().mockResolvedValue({
        id: 'tx-uuid-1',
        description: 'Cachê - Show no Festival de Verão',
        amount: 1500,
        type: 'INCOME',
        date: new Date('2026-10-15T20:00:00.000Z'),
        bandId: mockBandId,
        userId: 'user-uuid-1',
        eventId: mockEventId,
      }),
      findFirst: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue({
        id: 'tx-uuid-1',
        description: 'Cachê - Show Atualizado',
        amount: 2000,
        type: 'INCOME',
      }),
      delete: jest.fn().mockResolvedValue({ id: 'tx-uuid-1' }),
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

    it('GET /events sem token deve retornar 401 Unauthorized', () => {
      return request(unauthApp.getHttpServer()).get('/events').expect(401);
    });

    it('POST /events sem token deve retornar 401 Unauthorized', () => {
      return request(unauthApp.getHttpServer())
        .post('/events')
        .send({
          title: 'Show Teste',
          date: '2026-10-15T20:00:00.000Z',
          location: 'Local',
          bandId: mockBandId,
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
            const req = context
              .switchToHttp()
              .getRequest<{ user?: CurrentUserPayload }>();
            req.user = {
              userId: 'user-uuid-1',
              email: 'test@example.com',
              role: 'ADMIN',
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

    describe('POST /events', () => {
      it('deve retornar 201 ao criar um evento com payload válido incluindo horários, tipo e cachê', () => {
        return request(app.getHttpServer())
          .post('/events')
          .send({
            title: 'Show no Festival de Verão',
            date: '2026-10-15T20:00:00.000Z',
            startTime: '19:30',
            endTime: '22:00',
            type: 'Show',
            fee: 1500,
            location: 'Concha Acústica',
            description: 'Apresentação principal do festival',
            bandId: mockBandId,
          })
          .expect(201)
          .expect((res) => {
            const body = res.body as { id: string; title: string };
            expect(body).toHaveProperty('id', mockEventId);
            expect(body.title).toBe('Show no Festival de Verão');
            expect(mockPrismaService.transaction.create).toHaveBeenCalled();
          });
      });

      it('deve retornar 404 ao tentar criar evento com bandId inexistente', () => {
        return request(app.getHttpServer())
          .post('/events')
          .send({
            title: 'Show Sem Banda',
            date: '2026-10-15T20:00:00.000Z',
            location: 'Local',
            bandId: '00000000-0000-4000-8000-000000000000',
          })
          .expect(404);
      });

      it('deve retornar 400 ao enviar campos não permitidos (forbidNonWhitelisted)', () => {
        return request(app.getHttpServer())
          .post('/events')
          .send({
            title: 'Show Teste',
            date: '2026-10-15T20:00:00.000Z',
            location: 'Local',
            bandId: mockBandId,
            id: 'tentativa-id-cliente',
          })
          .expect(400);
      });

      it('deve retornar 201 ao criar um evento sem bandId (resolução automática de workspace)', () => {
        return request(app.getHttpServer())
          .post('/events')
          .send({
            title: 'Show Solo',
            date: '2026-10-15T20:00:00.000Z',
            location: 'Auditório',
          })
          .expect(201)
          .expect((res) => {
            const body = res.body as { id: string; title: string };
            expect(body).toHaveProperty('id', mockEventId);
          });
      });
    });

    describe('GET /events', () => {
      it('deve retornar 200 com a lista de eventos', () => {
        return request(app.getHttpServer())
          .get('/events')
          .expect(200)
          .expect((res) => {
            const body = res.body as unknown[];
            expect(Array.isArray(body)).toBe(true);
            expect(body.length).toBeGreaterThan(0);
          });
      });

      it('deve retornar 200 ao filtrar por bandId', () => {
        return request(app.getHttpServer())
          .get(`/events?bandId=${mockBandId}`)
          .expect(200)
          .expect((res) => {
            const body = res.body as { bandId: string }[];
            expect(Array.isArray(body)).toBe(true);
            expect(body[0].bandId).toBe(mockBandId);
          });
      });
    });

    describe('GET /events/:id', () => {
      it('deve retornar 200 com os detalhes de um evento existente', () => {
        return request(app.getHttpServer())
          .get(`/events/${mockEventId}`)
          .expect(200)
          .expect((res) => {
            const body = res.body as { id: string; title: string };
            expect(body.id).toBe(mockEventId);
            expect(body.title).toBe('Show no Festival de Verão');
          });
      });

      it('deve retornar 404 quando o evento não for encontrado', () => {
        return request(app.getHttpServer())
          .get('/events/00000000-0000-0000-0000-000000000000')
          .expect(404);
      });
    });

    describe('PATCH /events/:id', () => {
      it('deve retornar 200 ao atualizar um evento com dados válidos incluindo horários e cachê', () => {
        return request(app.getHttpServer())
          .patch(`/events/${mockEventId}`)
          .send({
            title: 'Show Atualizado',
            startTime: '20:00',
            endTime: '23:00',
            type: 'Show',
            fee: 2000,
          })
          .expect(200)
          .expect((res) => {
            const body = res.body as { title: string };
            expect(body.title).toBe('Show Atualizado');
          });
      });

      it('deve retornar 404 ao tentar atualizar um evento inexistente', () => {
        return request(app.getHttpServer())
          .patch('/events/00000000-0000-0000-0000-000000000000')
          .send({ title: 'Novo' })
          .expect(404);
      });

      it('deve retornar 400 ao enviar campo não permitido no PATCH', () => {
        return request(app.getHttpServer())
          .patch(`/events/${mockEventId}`)
          .send({ campoInvalido: 123 })
          .expect(400);
      });
    });

    describe('DELETE /events/:id', () => {
      it('deve retornar 204 No Content ao remover um evento com sucesso', () => {
        return request(app.getHttpServer())
          .delete(`/events/${mockEventId}`)
          .expect(204);
      });

      it('deve retornar 404 ao tentar remover um evento inexistente', () => {
        return request(app.getHttpServer())
          .delete('/events/00000000-0000-0000-0000-000000000000')
          .expect(404);
      });
    });
  });
});
