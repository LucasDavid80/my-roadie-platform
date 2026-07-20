import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateTaskDto {
  @IsString({ message: 'A descrição deve ser um texto' })
  @IsNotEmpty({ message: 'A descrição não pode estar vazia' })
  description!: string;

  @IsUUID('4', { message: 'O eventId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'O eventId é obrigatório' })
  eventId!: string;

  @IsBoolean({ message: 'O campo isDone deve ser um valor booleano' })
  @IsOptional()
  isDone?: boolean;
}
