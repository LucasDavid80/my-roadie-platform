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
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createEventDto: CreateEventDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.eventsService.create(createEventDto, user);
  }

  @Get()
  findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query('bandId') bandId?: string,
  ) {
    return this.eventsService.findAll(user, bandId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.eventsService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.eventsService.update(id, updateEventDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.eventsService.remove(id, user);
  }
}
