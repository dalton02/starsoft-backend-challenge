import { Body, Controller, Post } from '@nestjs/common';
import { Doc } from 'src/utils/documentation/doc';
import { AuthModel } from './auth.model';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Auth/')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Doc({
    name: 'Sign Up',
    description: 'Create a user in the system as Customer or Manager',
    response: AuthModel.Response.Auth,
  })
  @Post('/sign-up')
  async signUp(@Body() body: AuthModel.Request.CreateUser) {
    return await this.service.signUp(body);
  }
  @Doc({
    name: 'Sign In',
    description: 'Just a simple login',
    response: AuthModel.Response.Auth,
  })
  @Post('/sign-in')
  async signIn(@Body() body: AuthModel.Request.Login) {
    return await this.service.signIn(body);
  }
}
