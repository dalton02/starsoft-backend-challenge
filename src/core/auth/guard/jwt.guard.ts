import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { AppErrorUnauthorized } from 'src/utils/errors/app-errors';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt-strategy') {
  //Apenas deixando no formato padrão de respostas https já predefinido
  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    if (err || !user) {
      throw new AppErrorUnauthorized('Token invalido');
    }
    return user;
  }
}
