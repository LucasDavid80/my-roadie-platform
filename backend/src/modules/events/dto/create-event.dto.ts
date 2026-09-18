import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { EventStatus } from '@prisma/client';
import { IsAfterDate } from '../../../common/decorators/is-after-date.decorator';

export class CreateEventDto {
  @IsString({ message: 'O título deve ser um texto' })
  @IsNotEmpty({ message: 'O título não pode estar vazio' })
  title!: string;

  @IsDateString({}, { message: 'startsAt deve ser uma string ISO8601 válida' })
  @IsNotEmpty({ message: 'startsAt é obrigatório' })
  startsAt!: string;

  @IsOptional()
  @IsDateString({}, { message: 'endsAt deve ser uma string ISO8601 válida' })
  @IsAfterDate('startsAt', { message: 'endsAt deve ser posterior a startsAt' })
  endsAt?: string;

  @IsString({ message: 'O timezone deve ser um texto' })
  @IsNotEmpty({ message: 'O timezone é obrigatório' })
  timezone!: string;

  @IsString({ message: 'O local deve ser um texto' })
  @IsNotEmpty({ message: 'O local não pode estar vazio' })
  location!: string;

  @IsString({ message: 'A descrição deve ser um texto' })
  @IsOptional()
  description?: string;

  @IsString({ message: 'O tipo deve ser um texto' })
  @IsOptional()
  type?: string;

  @IsNumber({}, { message: 'O cachê deve ser um número' })
  @IsOptional()
  fee?: number;

  @IsUUID('4', { message: 'O bandId deve ser um UUID válido' })
  @IsOptional()
  bandId?: string;

  @IsEnum(EventStatus, {
    message:
      'O status deve ser um EventStatus válido (PENDING, CONFIRMED, FINISHED, CANCELLED)',
  })
  @IsOptional()
  status?: EventStatus;
}
