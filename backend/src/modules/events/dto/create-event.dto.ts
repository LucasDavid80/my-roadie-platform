import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { EventStatus } from '@prisma/client';

export class CreateEventDto {
  @IsString({ message: 'O título deve ser um texto' })
  @IsNotEmpty({ message: 'O título não pode estar vazio' })
  title!: string;

  @IsDateString({}, { message: 'A data deve ser uma string ISO8601 válida' })
  @IsNotEmpty({ message: 'A data é obrigatória' })
  date!: string;

  @IsString({ message: 'O local deve ser um texto' })
  @IsNotEmpty({ message: 'O local não pode estar vazio' })
  location!: string;

  @IsString({ message: 'A descrição deve ser um texto' })
  @IsOptional()
  description?: string;

  @IsUUID('4', { message: 'O bandId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'O bandId é obrigatório' })
  bandId!: string;

  @IsEnum(EventStatus, {
    message:
      'O status deve ser um EventStatus válido (PENDING, CONFIRMED, FINISHED, CANCELLED)',
  })
  @IsOptional()
  status?: EventStatus;
}
