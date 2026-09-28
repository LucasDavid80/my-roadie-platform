import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { BandsService } from './bands.service';

@Controller('bands')
@UseGuards(JwtAuthGuard)
export class BandsController {
  constructor(private readonly bandsService: BandsService) {}

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.bandsService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.bandsService.findOne(id, user);
  }
}
