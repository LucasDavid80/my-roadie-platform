import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { BandAccessModule } from '../band-access/band-access.module';

@Module({
  imports: [PrismaModule, BandAccessModule],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
