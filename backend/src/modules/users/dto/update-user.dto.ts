import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// O PartialType faz com que todos os campos do CreateUserDto 
// se tornem opcionais e herda as validações automaticamente.
export class UpdateUserDto extends PartialType(CreateUserDto) { }