import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AuthModel } from '../auth.model';
import { AppErrorUnauthorized } from 'src/utils/errors/app-errors';
import { UserRole } from '../enum/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthModel.UserRequest;

    if (!user) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    const rolesAllowed = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!rolesAllowed.includes(user.role)) {
      throw new AppErrorUnauthorized(
        'Usuário não tem permissão de acessar esse recurso',
      );
    }

    return true;
  }
}

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
