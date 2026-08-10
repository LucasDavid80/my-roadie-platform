import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { BandAccessModule } from '../band-access/band-access.module';

@Module({
  imports: [PrismaModule, BandAccessModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
