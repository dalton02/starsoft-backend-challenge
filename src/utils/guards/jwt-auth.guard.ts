import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppError, AppErrorUnauthorized } from '../errors/app-errors';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }

  handleRequest(err, payload) {
    if (err) {
      if (err instanceof AppError) {
        throw err;
      }

      throw new AppErrorUnauthorized('Sem autorização para acessar o conteúdo');
    }

    if (!payload) {
      throw new AppErrorUnauthorized('Sem autorização para acessar o conteúdo');
    }

    return payload;
  }
}
