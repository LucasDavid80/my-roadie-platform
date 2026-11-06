import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateBandDto {
  @IsString({ message: 'O nome da banda deve ser um texto' })
  @IsNotEmpty({ message: 'O nome da banda não pode estar vazio' })
  @Matches(/\S/, {
    message: 'O nome da banda deve conter pelo menos um caractere não vazio',
  })
  @MaxLength(100, {
    message: 'O nome da banda deve ter no máximo 100 caracteres',
  })
  name!: string;
}
