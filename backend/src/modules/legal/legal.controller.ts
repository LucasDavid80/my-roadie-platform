import { Controller, Get } from '@nestjs/common';
import { LegalService } from './legal.service';

@Controller('legal')
export class LegalController {
  constructor(private readonly legalService: LegalService) {}

  @Get('current-version')
  getCurrentVersion() {
    return this.legalService.getCurrentVersion();
  }
}
