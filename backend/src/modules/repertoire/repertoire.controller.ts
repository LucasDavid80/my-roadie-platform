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
import { RepertoireService } from './repertoire.service';
import { CreateRepertoireSongDto } from './dto/create-repertoire-song.dto';
import { UpdateRepertoireSongDto } from './dto/update-repertoire-song.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';

@Controller('repertoire')
@UseGuards(JwtAuthGuard)
export class RepertoireController {
  constructor(private readonly repertoireService: RepertoireService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createDto: CreateRepertoireSongDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.repertoireService.create(createDto, user);
  }

  @Get()
  findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query('bandId') bandId?: string,
  ) {
    return this.repertoireService.findAll(user, bandId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.repertoireService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateRepertoireSongDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.repertoireService.update(id, updateDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.repertoireService.remove(id, user);
  }
}
