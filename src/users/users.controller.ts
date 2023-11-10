import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Delete,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(Role.Admin)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    if (createUserDto.roles !== Role.User) {
      throw new HttpException('role must be user', HttpStatus.NOT_ACCEPTABLE);
    }
    return this.usersService.create(createUserDto);
  }

  @Roles(Role.Admin)
  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    if (!users) {
      return [];
    }
    return users;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto, id);
  }

  @Roles(Role.Admin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
