import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { BandAccessModule } from '../band-access/band-access.module';

@Module({
  imports: [PrismaModule, BandAccessModule],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
