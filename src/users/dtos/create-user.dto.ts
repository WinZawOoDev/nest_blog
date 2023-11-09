import { IsEmail, Length } from 'class-validator';

export class CreateUserDto {
  @Length(5, 20)
  name: string;

  @IsEmail()
  email: string;

  @Length(6, 8)
  password: string;

  role: string;
}
