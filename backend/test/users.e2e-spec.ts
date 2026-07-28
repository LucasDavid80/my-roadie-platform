import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { JwtAuthGuard } from './../src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './../src/modules/auth/guards/roles.guard';
import { PrismaService } from './../src/prisma/prisma.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  const mockPrismaService = {
    user: {
      create: jest.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          id: 'uuid-123',
          ...data,
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
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
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

  describe('/users (POST)', () => {
    it('deve retornar 201 ao criar um usuário válido', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'lucas@myroadie.br',
          supabaseId: 'sb-123',
          name: 'Lucas',
          role: 'ROADIE',
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

    it('deve retornar 400 ao enviar role inexistente', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'lucas@myroadie.br',
          supabaseId: 'sb-123',
          role: 'BATMAN',
        })
        .expect(400);
    });
  });
});
