import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.tasksService.create(createTaskDto, user);
  }

  @Get()
  findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query('eventId') eventId?: string,
  ) {
    return this.tasksService.findAll(user, eventId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.tasksService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.tasksService.update(id, updateTaskDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.tasksService.remove(id, user);
  }
}
