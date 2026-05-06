import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    console.log(
      'DATABASE_URL carregada:',
      connectionString ? 'SIM' : 'NÃO - UNDEFINED',
    );

    const adapter = new PrismaPg({
      connectionString: connectionString as string,
    });
    super({ adapter });
  }
}
