import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { Role } from './enums/role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
  ) {}

  async register(creatUserDto: CreateUserDto): Promise<any> {
    const admin = await this.userService.findAdmin();
    if (admin) {
      throw new HttpException(
        'Admin role already registered',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    const createAdmin = await this.userService.create(creatUserDto);
    if (createAdmin) {
      return this.signToken({
        id: createAdmin._id.toString(),
        name: createAdmin.name,
        email: createAdmin.email,
        roles: createAdmin.roles,
      });
    }
    return null;
  }

  async signIn(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOne(email);
    console.log(user);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    if (!bcrypt.compareSync(pass, user.password)) {
      throw new UnauthorizedException();
    }

    return this.signToken({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      roles: user.roles,
    });
  }

  async signToken(user: {
    id: string;
    name: string;
    email: string;
    roles: Role[];
  }) {
    const { id, ...rest } = user;

    return {
      user,
      access_token: await this.jwtService.signAsync({
        sub: user.id,
        ...rest,
      }),
    };
  }
}
