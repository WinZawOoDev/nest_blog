import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Body,
  Get,
  Request,
  HttpException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { Role } from './enums/role.enum';
import { RegisterDto } from './dot/register.dto';
import { SignInDto } from './dot/signin';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('register/admin')
  register(@Body() regiserDto: RegisterDto) {
    if (regiserDto.roles !== Role.Admin) {
      throw new HttpException('Role must be admin', HttpStatus.NOT_ACCEPTABLE);
    }
    return this.authService.register(regiserDto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return this.userService.getProfile(req.user.sub);
  }
}
