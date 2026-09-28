import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateBandDto {
  @IsString({ message: 'O nome da banda deve ser um texto' })
  @IsNotEmpty({ message: 'O nome da banda não pode estar vazio' })
  @MaxLength(100, {
    message: 'O nome da banda deve ter no máximo 100 caracteres',
  })
  name!: string;
}
