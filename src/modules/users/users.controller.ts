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
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { Role } from 'src/modules/auth/enums/role.enum';
import { OrganizationsService } from 'src/modules/organizations/organizations.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly orgService: OrganizationsService,
  ) {}

  @Roles(Role.Admin)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    if (createUserDto.roles !== Role.User)
      throw new HttpException('role must be user', HttpStatus.NOT_ACCEPTABLE);

    const org = await this.orgService.findOne(createUserDto.org_id);
    if (!org)
      throw new HttpException('Organization not found', HttpStatus.NOT_FOUND);

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
    const user = await this.usersService.findById(id);
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
