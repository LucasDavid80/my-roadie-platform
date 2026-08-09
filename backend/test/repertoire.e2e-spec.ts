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

describe('RepertoireController (e2e)', () => {
  const mockBandId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  const mockSongId = 'b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a22';

  const mockBand = {
    id: mockBandId,
    name: 'Banda Exemplo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockSong = {
    id: mockSongId,
    title: 'Música Exemplo',
    artist: 'Artista Exemplo',
    key: 'C#m',
    position: 1,
    notes: 'Intro no violão',
    bandId: mockBandId,
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
    repertoireSong: {
      create: jest.fn().mockResolvedValue(mockSong),
      findMany: jest
        .fn()
        .mockImplementation(
          ({ where }: { where?: { bandId?: string } } = {}) => {
            if (where && where.bandId === mockBandId)
              return Promise.resolve([mockSong]);
            if (where && where.bandId === 'non-existent-band')
              return Promise.resolve([]);
            return Promise.resolve([mockSong]);
          },
        ),
      findUnique: jest
        .fn()
        .mockImplementation(({ where }: { where: { id: string } }) => {
          if (where.id === mockSongId) return Promise.resolve(mockSong);
          return Promise.resolve(null);
        }),
      update: jest.fn().mockResolvedValue({
        ...mockSong,
        title: 'Música Atualizada',
        position: 2,
      }),
      delete: jest.fn().mockResolvedValue(mockSong),
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

    it('GET /repertoire sem token deve retornar 401 Unauthorized', () => {
      return request(unauthApp.getHttpServer()).get('/repertoire').expect(401);
    });

    it('POST /repertoire sem token deve retornar 401 Unauthorized', () => {
      return request(unauthApp.getHttpServer())
        .post('/repertoire')
        .send({
          title: 'Música Exemplo',
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

    describe('POST /repertoire', () => {
      it('deve retornar 201 ao criar uma música com payload válido', () => {
        return request(app.getHttpServer())
          .post('/repertoire')
          .send({
            title: 'Música Exemplo',
            bandId: mockBandId,
            artist: 'Artista Exemplo',
            key: 'C#m',
            position: 1,
            notes: 'Intro no violão',
          })
          .expect(201)
          .expect((res) => {
            const body = res.body as { id: string; title: string };
            expect(body).toHaveProperty('id', mockSongId);
            expect(body.title).toBe('Música Exemplo');
          });
      });

      it('deve retornar 404 ao tentar criar música para banda inexistente', () => {
        return request(app.getHttpServer())
          .post('/repertoire')
          .send({
            title: 'Música Nova',
            bandId: '00000000-0000-4000-8000-000000000000',
          })
          .expect(404);
      });

      it('deve retornar 400 ao enviar campos não permitidos (forbidNonWhitelisted)', () => {
        return request(app.getHttpServer())
          .post('/repertoire')
          .send({
            title: 'Música Nova',
            bandId: mockBandId,
            campoExtra: 'invalido',
          })
          .expect(400);
      });
    });

    describe('GET /repertoire', () => {
      it('deve retornar 200 com a lista de músicas', () => {
        return request(app.getHttpServer())
          .get('/repertoire')
          .expect(200)
          .expect((res) => {
            const body = res.body as unknown[];
            expect(Array.isArray(body)).toBe(true);
            expect(body.length).toBeGreaterThan(0);
          });
      });

      it('deve retornar 200 filtrando músicas por bandId', () => {
        return request(app.getHttpServer())
          .get(`/repertoire?bandId=${mockBandId}`)
          .expect(200)
          .expect((res) => {
            const body = res.body as { bandId: string }[];
            expect(Array.isArray(body)).toBe(true);
            expect(body[0].bandId).toBe(mockBandId);
          });
      });
    });

    describe('GET /repertoire/:id', () => {
      it('deve retornar 200 com os detalhes de uma música existente', () => {
        return request(app.getHttpServer())
          .get(`/repertoire/${mockSongId}`)
          .expect(200)
          .expect((res) => {
            const body = res.body as { id: string };
            expect(body.id).toBe(mockSongId);
          });
      });

      it('deve retornar 404 quando a música não for encontrada', () => {
        return request(app.getHttpServer())
          .get('/repertoire/00000000-0000-0000-0000-000000000000')
          .expect(404);
      });
    });

    describe('PATCH /repertoire/:id', () => {
      it('deve retornar 200 ao atualizar uma música com dados válidos', () => {
        return request(app.getHttpServer())
          .patch(`/repertoire/${mockSongId}`)
          .send({
            title: 'Música Atualizada',
            position: 2,
          })
          .expect(200)
          .expect((res) => {
            const body = res.body as { title: string; position: number };
            expect(body.title).toBe('Música Atualizada');
            expect(body.position).toBe(2);
          });
      });

      it('deve retornar 404 ao tentar atualizar uma música inexistente', () => {
        return request(app.getHttpServer())
          .patch('/repertoire/00000000-0000-0000-0000-000000000000')
          .send({ title: 'Novo Título' })
          .expect(404);
      });

      it('deve retornar 400 ao enviar propriedade extra no PATCH', () => {
        return request(app.getHttpServer())
          .patch(`/repertoire/${mockSongId}`)
          .send({ id: 'tentativa-alterar-id' })
          .expect(400);
      });
    });

    describe('DELETE /repertoire/:id', () => {
      it('deve retornar 204 No Content ao remover uma música com sucesso', () => {
        return request(app.getHttpServer())
          .delete(`/repertoire/${mockSongId}`)
          .expect(204);
      });

      it('deve retornar 404 ao tentar remover uma música inexistente', () => {
        return request(app.getHttpServer())
          .delete('/repertoire/00000000-0000-0000-0000-000000000000')
          .expect(404);
      });
    });
  });
});
