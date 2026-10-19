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
import { Role } from '@prisma/client';

describe('BandsController (e2e)', () => {
  const band = {
    id: 'band-1',
    name: 'Banda Exemplo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const prisma = {
    $transaction: jest.fn((callback: (tx: typeof prisma) => unknown) =>
      callback(prisma),
    ),
    user: {
      findFirst: jest.fn().mockResolvedValue({ id: 'user-1' }),
      create: jest.fn(),
    },
    band: {
      findMany: jest.fn().mockResolvedValue([band]),
      findUnique: jest.fn().mockResolvedValue(band),
      create: jest.fn().mockResolvedValue(band),
      update: jest
        .fn()
        .mockResolvedValue({ ...band, name: 'Banda Atualizada' }),
      delete: jest.fn(),
    },
    bandMember: {
      findMany: jest.fn().mockResolvedValue([{ bandId: band.id }]),
      findFirst: jest
        .fn()
        .mockImplementation(({ where }: { where: { bandId: string } }) =>
          where.bandId === band.id
            ? Promise.resolve({ id: 'member-1' })
            : Promise.resolve(null),
        ),
      deleteMany: jest.fn(),
    },
    event: { count: jest.fn().mockResolvedValue(0) },
    repertoireSong: { count: jest.fn().mockResolvedValue(0) },
    transaction: { count: jest.fn().mockResolvedValue(0) },
  };

  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const requestContext = context.switchToHttp().getRequest<{
            user?: CurrentUserPayload;
            headers: Record<string, string>;
          }>();
          const role =
            requestContext.headers['x-test-role'] === 'ADMIN'
              ? Role.ADMIN
              : Role.MUSICIAN;
          requestContext.user = {
            userId: role === Role.ADMIN ? 'admin-1' : 'user-1',
            email: 'test@example.com',
            role,
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

  it('deve listar bandas para um usuário autenticado', () => {
    return request(app.getHttpServer())
      .get('/bands')
      .expect(200)
      .expect((response) => {
        expect(response.body).toEqual([band]);
      });
  });

  it('deve criar uma banda com payload válido', () => {
    return request(app.getHttpServer())
      .post('/bands')
      .send({ name: 'Banda Exemplo' })
      .expect(201)
      .expect((response) => {
        expect(response.body).toEqual(band);
      });
  });

  it('deve rejeitar nome vazio e campos extras', () => {
    return request(app.getHttpServer())
      .post('/bands')
      .send({ name: '', id: 'client-generated-id' })
      .expect(400);
  });

  it('deve rejeitar acesso de não membro aos detalhes da banda', () => {
    return request(app.getHttpServer()).get('/bands/other-band').expect(403);
  });

  it('deve permitir que ADMIN acesse a lista sem depender de associação', () => {
    return request(app.getHttpServer())
      .get('/bands')
      .set('x-test-role', 'ADMIN')
      .expect(200);
  });
});
