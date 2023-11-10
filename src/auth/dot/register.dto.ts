import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class RegisterDto {
  @Length(2, 10)
  name: string;

  @IsEmail()
  email: string;

  @Length(6, 8)
  password: string;

  @IsNotEmpty()
  roles: string;
}
