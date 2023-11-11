import { PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateProfileDto extends PickType(CreateUserDto, ['name']) {}
