import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { BandAccessModule } from '../band-access/band-access.module';
import { BandsController } from './bands.controller';
import { BandsService } from './bands.service';

@Module({
  imports: [PrismaModule, BandAccessModule],
  controllers: [BandsController],
  providers: [BandsService],
  exports: [BandsService],
})
export class BandsModule {}
