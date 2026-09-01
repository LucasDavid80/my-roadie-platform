import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUserRoleDto {
  @IsEnum(Role, {
    message: 'O cargo (role) deve ser MUSICIAN, ROADIE ou ADMIN',
  })
  @IsNotEmpty({ message: 'O cargo (role) é obrigatório' })
  role!: Role;
}
