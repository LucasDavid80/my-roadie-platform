import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Esta linha ativa a validação automática baseada nos DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove campos que não estão no DTO
      forbidNonWhitelisted: true, // Dá erro se enviarem campos extras
      transform: true, // Transforma os tipos automaticamente
    }),
  );

  app.enableCors();
  await app.listen(process.env.PORT || 3001);
}
bootstrap();
