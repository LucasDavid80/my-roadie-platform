import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateRepertoireSongDto {
  @IsString({ message: 'O título deve ser um texto' })
  @IsOptional()
  title?: string;

  @IsString({ message: 'O artista deve ser um texto' })
  @IsOptional()
  artist?: string;

  @IsString({ message: 'O tom deve ser um texto' })
  @IsOptional()
  key?: string;

  @IsInt({ message: 'A posição deve ser um número inteiro' })
  @IsOptional()
  position?: number;

  @IsString({ message: 'As notas devem ser um texto' })
  @IsOptional()
  notes?: string;
}
