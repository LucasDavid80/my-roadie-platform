import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { JwtAuthGuard } from './../src/modules/auth/guards/jwt-auth.guard';
import { PrismaService } from './../src/prisma/prisma.service';
import { Role } from '@prisma/client';
import { CurrentUserPayload } from './../src/modules/auth/decorators/current-user.decorator';

describe('UsersController (e2e)', () => {
  let app: INestApplication<App>;
  let currentUser: CurrentUserPayload = {
    userId: 'uuid-123',
    email: 'lucas@myroadie.br',
    role: Role.MUSICIAN,
  };

  const mockUser = {
    id: 'uuid-123',
    supabaseId: 'sb-123',
    email: 'lucas@myroadie.br',
    name: 'Lucas',
    role: Role.MUSICIAN,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      create: jest
        .fn()
        .mockImplementation(({ data }: { data: Record<string, unknown> }) =>
          Promise.resolve({
            id: 'uuid-123',
            role: Role.MUSICIAN,
            ...data,
          }),
        ),
      findFirst: jest.fn().mockImplementation(
        ({
          where,
        }: {
          where?: {
            OR?: Array<{ id?: string; supabaseId?: string; email?: string }>;
          };
        }) => {
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
          return Promise.resolve(mockUser);
        },
      ),
      findUnique: jest
        .fn()
        .mockImplementation(
          ({ where }: { where: { id?: string; email?: string } }) => {
            if (where.email === mockUser.email || where.id === mockUser.id) {
              return Promise.resolve(mockUser);
            }
            return Promise.resolve(mockUser);
          },
        ),
      update: jest
        .fn()
        .mockImplementation(
          ({
            data,
            where,
          }: {
            data: Record<string, unknown>;
            where: { id: string };
          }) =>
            Promise.resolve({
              ...mockUser,
              ...data,
              id: where.id,
            }),
        ),
    },
  };

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
          req.user = currentUser;
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

  beforeEach(() => {
    currentUser = {
      userId: 'uuid-123',
      email: 'lucas@myroadie.br',
      role: Role.MUSICIAN,
    };
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users (POST)', () => {
    it('deve retornar 201 ao criar um usuário válido', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'lucas@myroadie.br',
          supabaseId: 'sb-123',
          name: 'Lucas',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
        });
    });

    it('deve retornar 400 ao enviar e-mail inválido', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'email-errado',
          supabaseId: 'sb-123',
          name: 'Lucas',
        })
        .expect(400);
    });

    it('deve retornar 400 ao enviar role inexistente ou tentar enviar role no cadastro público (POST /users)', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'lucas@myroadie.br',
          supabaseId: 'sb-123',
          role: 'ADMIN',
        })
        .expect(400);
    });
  });

  describe('/users/:id (PATCH)', () => {
    it('deve atualizar o próprio perfil com sucesso', () => {
      return request(app.getHttpServer())
        .patch('/users/uuid-123')
        .send({
          name: 'Lucas Editado',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('name', 'Lucas Editado');
        });
    });

    it('deve retornar 400 quando usuário tentar enviar role: ADMIN no PATCH /users/:id', () => {
      return request(app.getHttpServer())
        .patch('/users/uuid-123')
        .send({
          role: 'ADMIN',
        })
        .expect(400);
    });
  });

  describe('/users/:id/role (PATCH)', () => {
    it('deve retornar 403 Forbidden quando usuário MUSICIAN tentar alterar role', () => {
      currentUser = {
        userId: 'uuid-123',
        email: 'lucas@myroadie.br',
        role: Role.MUSICIAN,
      };

      return request(app.getHttpServer())
        .patch('/users/uuid-123/role')
        .send({
          role: 'ADMIN',
        })
        .expect(403);
    });

    it('deve retornar 200 e atualizar role com sucesso quando usuário for ADMIN', () => {
      currentUser = {
        userId: 'admin-123',
        email: 'admin@myroadie.br',
        role: Role.ADMIN,
      };

      return request(app.getHttpServer())
        .patch('/users/uuid-123/role')
        .send({
          role: 'ADMIN',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('role', Role.ADMIN);
        });
    });
  });
});
