import { IsString, IsNotEmpty } from 'class-validator';

export class ConsentDto {
  @IsString()
  @IsNotEmpty()
  termsVersion: string;
}
