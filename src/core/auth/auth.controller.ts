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
    description: 'Cadastrar no sistema como customer ou manager',
    response: AuthModel.AuthResponse,
  })
  @Post('/sign-up')
  async signUp(@Body() body: AuthModel.CreateUser) {
    return await this.service.signUp(body);
  }
  @Doc({
    name: 'Sign In',

    description: 'Login no sistema',
    response: AuthModel.AuthResponse,
  })
  @Post('/sign-in')
  async signIn(@Body() body: AuthModel.Login) {
    return await this.service.signIn(body);
  }
}
