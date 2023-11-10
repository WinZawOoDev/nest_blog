import { OmitType, PartialType, PickType } from '@nestjs/mapped-types';
import { RegisterDto } from './register.dto';

export class SignInDto extends PickType(RegisterDto, [
  'email',
  'password',
]) {}
