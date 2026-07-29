import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @IsString({ message: 'A descrição deve ser um texto' })
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  description!: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'O valor deve ser um número' })
  @IsPositive({ message: 'O valor deve ser positivo' })
  amount!: number;

  @IsEnum(TransactionType, { message: 'O tipo deve ser INCOME ou EXPENSE' })
  type!: TransactionType;

  @IsDateString({}, { message: 'A data deve ser uma string ISO8601 válida' })
  date!: string;

  @IsUUID('4', { message: 'O bandId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'O bandId é obrigatório' })
  bandId!: string;

  @IsUUID('4', { message: 'O userId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'O userId é obrigatório' })
  userId!: string;

  @IsOptional()
  @IsUUID('4', { message: 'O eventId deve ser um UUID válido' })
  eventId?: string;
}
