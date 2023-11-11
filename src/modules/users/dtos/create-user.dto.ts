import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class CreateUserDto {
  @Length(2, 20)
  name: string;

  @IsEmail()
  email: string;

  @Length(6, 8)
  password: string;

  @IsNotEmpty()
  roles: string;

  @IsNotEmpty()
  org_id: string;
}
