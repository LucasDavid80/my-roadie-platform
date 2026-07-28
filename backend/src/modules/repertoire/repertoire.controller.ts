import { Controller } from '@nestjs/common';
import { RepertoireService } from './repertoire.service';

@Controller('repertoire')
export class RepertoireController {
  constructor(private readonly repertoireService: RepertoireService) {}
}
