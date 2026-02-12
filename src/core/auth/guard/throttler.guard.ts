import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';
import { AuthModel } from '../auth.model';

@Injectable()
export class ThrottlerUserAndIpGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    const user = req.user as AuthModel.UserContext;

    if (user?.id) {
      return `user:${user.id}`;
    }

    return `ip:${req.ip}`;
  }
}
