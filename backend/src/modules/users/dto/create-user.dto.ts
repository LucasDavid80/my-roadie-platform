import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'O e-mail deve ser um endereço válido' })
  @IsNotEmpty({ message: 'O e-mail não pode estar vazio' })
  email!: string;

  @IsString({ message: 'O supabaseId deve ser um texto' })
  @IsNotEmpty({ message: 'O supabaseId é obrigatório' })
  supabaseId!: string;

  @IsString({ message: 'O nome deve ser um texto' })
  @IsOptional()
  name?: string;

  @IsEnum(['MUSICIAN', 'ROADIE', 'ADMIN'], {
    message: 'O cargo (role) deve ser MUSICIAN, ROADIE ou ADMIN',
  })
  @IsOptional()
  role?: 'MUSICIAN' | 'ROADIE' | 'ADMIN';

  @IsString()
  @IsOptional()
  experience?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  instagram?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  federativeUnit?: string;

  @IsOptional()
  minCache?: number;

  @IsString()
  @IsOptional()
  youtubeLink?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString({ each: true })
  @IsOptional()
  instruments?: string[];

  @IsString({ each: true })
  @IsOptional()
  styles?: string[];

  @IsOptional()
  isAvailable?: boolean;
}
