import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateTaskDto {
  @IsString({ message: 'A descrição deve ser um texto' })
  @IsOptional()
  description?: string;

  @IsBoolean({ message: 'O campo isDone deve ser um valor booleano' })
  @IsOptional()
  isDone?: boolean;
}
