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

describe('TasksController (e2e)', () => {
  const mockEventId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  const mockTaskId = 'b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a22';

  const mockEvent = {
    id: mockEventId,
    title: 'Show de Lançamento',
    date: new Date().toISOString(),
    location: 'Teatro Castro Alves',
    description: 'Show principal',
    createdById: 'user-uuid-1',
    bandId: 'band-uuid-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'CONFIRMED',
  };

  const mockTask = {
    id: mockTaskId,
    description: 'Passagem de som e checagem de cabos',
    isDone: false,
    eventId: mockEventId,
    createdAt: new Date().toISOString(),
  };

  const mockPrismaService = {
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
            if (
              where.bandId === 'band-uuid-1' &&
              where.userId === 'user-uuid-1'
            ) {
              return Promise.resolve({
                id: 'bm-1',
                bandId: 'band-uuid-1',
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
                { id: 'bm-1', bandId: 'band-uuid-1', userId: 'user-uuid-1' },
              ]);
            }
            return Promise.resolve([]);
          },
        ),
    },
    task: {
      create: jest.fn().mockResolvedValue(mockTask),
      findMany: jest
        .fn()
        .mockImplementation(
          ({ where }: { where?: { eventId?: string } } = {}) => {
            if (where && where.eventId === mockEventId)
              return Promise.resolve([mockTask]);
            if (where && where.eventId === 'non-existent-event')
              return Promise.resolve([]);
            return Promise.resolve([mockTask]);
          },
        ),
      findUnique: jest
        .fn()
        .mockImplementation(({ where }: { where: { id: string } }) => {
          if (where.id === mockTaskId)
            return Promise.resolve({ ...mockTask, event: mockEvent });
          return Promise.resolve(null);
        }),
      update: jest.fn().mockResolvedValue({
        ...mockTask,
        isDone: true,
        description: 'Atualizada',
      }),
      delete: jest.fn().mockResolvedValue(mockTask),
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

    it('GET /tasks sem token deve retornar 401 Unauthorized', () => {
      return request(unauthApp.getHttpServer()).get('/tasks').expect(401);
    });

    it('POST /tasks sem token deve retornar 401 Unauthorized', () => {
      return request(unauthApp.getHttpServer())
        .post('/tasks')
        .send({
          description: 'Passagem de som',
          eventId: mockEventId,
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

    describe('POST /tasks', () => {
      it('deve retornar 201 ao criar uma tarefa com payload válido', () => {
        return request(app.getHttpServer())
          .post('/tasks')
          .send({
            description: 'Passagem de som e checagem de cabos',
            eventId: mockEventId,
            isDone: false,
          })
          .expect(201)
          .expect((res) => {
            const body = res.body as { id: string; description: string };
            expect(body).toHaveProperty('id', mockTaskId);
            expect(body.description).toBe(
              'Passagem de som e checagem de cabos',
            );
          });
      });

      it('deve retornar 404 ao tentar criar tarefa para evento inexistente', () => {
        return request(app.getHttpServer())
          .post('/tasks')
          .send({
            description: 'Passagem de som',
            eventId: '00000000-0000-4000-8000-000000000000',
          })
          .expect(404);
      });

      it('deve retornar 400 ao enviar campos não permitidos (forbidNonWhitelisted)', () => {
        return request(app.getHttpServer())
          .post('/tasks')
          .send({
            description: 'Passagem de som',
            eventId: mockEventId,
            campoExtra: 'invalido',
          })
          .expect(400);
      });
    });

    describe('GET /tasks', () => {
      it('deve retornar 200 com a lista de tarefas', () => {
        return request(app.getHttpServer())
          .get('/tasks')
          .expect(200)
          .expect((res) => {
            const body = res.body as unknown[];
            expect(Array.isArray(body)).toBe(true);
            expect(body.length).toBeGreaterThan(0);
          });
      });

      it('deve retornar 200 filtrando tarefas por eventId', () => {
        return request(app.getHttpServer())
          .get(`/tasks?eventId=${mockEventId}`)
          .expect(200)
          .expect((res) => {
            const body = res.body as { eventId: string }[];
            expect(Array.isArray(body)).toBe(true);
            expect(body[0].eventId).toBe(mockEventId);
          });
      });
    });

    describe('GET /tasks/:id', () => {
      it('deve retornar 200 com os detalhes de uma tarefa existente', () => {
        return request(app.getHttpServer())
          .get(`/tasks/${mockTaskId}`)
          .expect(200)
          .expect((res) => {
            const body = res.body as { id: string };
            expect(body.id).toBe(mockTaskId);
          });
      });

      it('deve retornar 404 quando a tarefa não for encontrada', () => {
        return request(app.getHttpServer())
          .get('/tasks/00000000-0000-0000-0000-000000000000')
          .expect(404);
      });
    });

    describe('PATCH /tasks/:id', () => {
      it('deve retornar 200 ao atualizar uma tarefa com dados válidos', () => {
        return request(app.getHttpServer())
          .patch(`/tasks/${mockTaskId}`)
          .send({
            isDone: true,
            description: 'Atualizada',
          })
          .expect(200)
          .expect((res) => {
            const body = res.body as { isDone: boolean };
            expect(body.isDone).toBe(true);
          });
      });

      it('deve retornar 404 ao tentar atualizar uma tarefa inexistente', () => {
        return request(app.getHttpServer())
          .patch('/tasks/00000000-0000-0000-0000-000000000000')
          .send({ isDone: true })
          .expect(404);
      });

      it('deve retornar 400 ao enviar propriedade extra no PATCH', () => {
        return request(app.getHttpServer())
          .patch(`/tasks/${mockTaskId}`)
          .send({ id: 'tentativa-alterar-id' })
          .expect(400);
      });
    });

    describe('DELETE /tasks/:id', () => {
      it('deve retornar 204 No Content ao remover uma tarefa com sucesso', () => {
        return request(app.getHttpServer())
          .delete(`/tasks/${mockTaskId}`)
          .expect(204);
      });

      it('deve retornar 404 ao tentar remover uma tarefa inexistente', () => {
        return request(app.getHttpServer())
          .delete('/tasks/00000000-0000-0000-0000-000000000000')
          .expect(404);
      });
    });
  });
});
