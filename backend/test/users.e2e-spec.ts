import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('UsersController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        // CRUCIAL: Ative o ValidationPipe no teste E2E também!
        // Sem isso, os testes de e-mail e role inválidos vão passar direto.
        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));

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
                    name: 'Lucas',
                })
                .expect(400); // O ValidationPipe deve barrar aqui
        });

        it('deve retornar 400 ao enviar role inexistente', () => {
            return request(app.getHttpServer())
                .post('/users')
                .send({
                    email: 'lucas@myroadie.br',
                    role: 'BATMAN', // Role inválido
                })
                .expect(400);
        });
    });
});
