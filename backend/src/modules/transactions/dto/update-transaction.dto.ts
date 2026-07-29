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

export class UpdateTransactionDto {
  @IsOptional()
  @IsString({ message: 'A descrição deve ser um texto' })
  @IsNotEmpty({ message: 'A descrição não pode estar vazia' })
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'O valor deve ser um número' })
  @IsPositive({ message: 'O valor deve ser positivo' })
  amount?: number;

  @IsOptional()
  @IsEnum(TransactionType, { message: 'O tipo deve ser INCOME ou EXPENSE' })
  type?: TransactionType;

  @IsOptional()
  @IsDateString({}, { message: 'A data deve ser uma string ISO8601 válida' })
  date?: string;

  @IsOptional()
  @IsUUID('4', { message: 'O eventId deve ser um UUID válido' })
  eventId?: string;
}
