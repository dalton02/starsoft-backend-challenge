import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { niceEnv } from 'src/utils/functions/env';
import { AuthModel } from '../auth.model';
import { AuthService } from '../auth.service';
import { AppErrorUnauthorized } from 'src/utils/errors/app-errors';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-strategy') {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: niceEnv.JWT_SECRET,
    });
  }

  async validate(
    payload: AuthModel.TokenPayload,
  ): Promise<AuthModel.UserRequest> {
    const userInfo = await this.authService.gatherUserInfo(payload.sub);
    console.log('passando pelo guard');
    return {
      id: userInfo.id,
      role: userInfo.role,
    };
  }
}
