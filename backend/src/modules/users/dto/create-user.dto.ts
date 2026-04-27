import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsEnum,
    IsString,
    MinLength,
} from 'class-validator';

export class CreateUserDto {
    @IsEmail({}, { message: 'O e-mail deve ser um endereço válido' })
    @IsNotEmpty({ message: 'O e-mail não pode estar vazio' })
    email!: string;

    @IsString()
    @MinLength(6)
    password!: string;

    @IsString({ message: 'O nome deve ser um texto' })
    @IsOptional()
    name?: string;

    @IsEnum(['MUSICIAN', 'ROADIE', 'ADMIN'], {
        message: 'O cargo (role) deve ser MUSICIAN, ROADIE ou ADMIN',
    })
    @IsOptional()
    role?: 'MUSICIAN' | 'ROADIE' | 'ADMIN';
}
