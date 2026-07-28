import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateRepertoireSongDto {
  @IsString({ message: 'O título deve ser um texto' })
  @IsNotEmpty({ message: 'O título é obrigatório' })
  title!: string;

  @IsUUID('4', { message: 'O bandId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'O bandId é obrigatório' })
  bandId!: string;

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
