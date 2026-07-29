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

@Controller('repertoire')
@UseGuards(JwtAuthGuard)
export class RepertoireController {
  constructor(private readonly repertoireService: RepertoireService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateRepertoireSongDto) {
    return this.repertoireService.create(createDto);
  }

  @Get()
  findAll(@Query('bandId') bandId?: string) {
    return this.repertoireService.findAll(bandId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.repertoireService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateRepertoireSongDto,
  ) {
    return this.repertoireService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.repertoireService.remove(id);
  }
}
