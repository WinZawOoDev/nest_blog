import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
  ) {}

  async signIn(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOne(email);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }

    const userInfo = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      roles: user.roles,
    };

    const { id, ...rest } = userInfo;

    return {
      user: userInfo,
      access_token: await this.jwtService.signAsync({
        sub: user._id.toString(),
        ...rest,
      }),
    };
  }
}
