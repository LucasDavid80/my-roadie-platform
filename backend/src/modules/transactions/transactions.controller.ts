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
import { TransactionType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.transactionsService.create(createTransactionDto, user);
  }

  @Get()
  findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query('bandId') bandId?: string,
    @Query('userId') userId?: string,
    @Query('eventId') eventId?: string,
    @Query('type') type?: TransactionType,
  ) {
    return this.transactionsService.findAll(
      { bandId, userId, eventId, type },
      user,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.transactionsService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.transactionsService.update(id, updateTransactionDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.transactionsService.remove(id, user);
  }
}
