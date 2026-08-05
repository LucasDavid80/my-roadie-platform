import { Module } from '@nestjs/common';
import { BandAccessService } from './band-access.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BandAccessService],
  exports: [BandAccessService],
})
export class BandAccessModule {}
