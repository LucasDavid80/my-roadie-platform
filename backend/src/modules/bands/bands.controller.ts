import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { CreateBandDto } from './dto/create-band.dto';
import { UpdateBandDto } from './dto/update-band.dto';
import { BandsService } from './bands.service';

@Controller('bands')
@UseGuards(JwtAuthGuard)
export class BandsController {
  constructor(private readonly bandsService: BandsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createBandDto: CreateBandDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.bandsService.create(createBandDto, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBandDto: UpdateBandDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.bandsService.update(id, updateBandDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.bandsService.remove(id, user);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.bandsService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.bandsService.findOne(id, user);
  }
}
