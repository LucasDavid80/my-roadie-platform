import { Module } from '@nestjs/common';
import { RepertoireController } from './repertoire.controller';
import { RepertoireService } from './repertoire.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { BandAccessModule } from '../band-access/band-access.module';

@Module({
  imports: [PrismaModule, BandAccessModule],
  controllers: [RepertoireController],
  providers: [RepertoireService],
  exports: [RepertoireService],
})
export class RepertoireModule {}
