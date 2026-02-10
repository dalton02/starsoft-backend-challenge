import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { AuthModel } from './auth.model';
import {
  AppErrorBadRequest,
  AppErrorConflict,
  AppErrorForbidden,
  AppErrorNotFound,
} from 'src/utils/errors/app-errors';
import { JwtService } from '@nestjs/jwt';
import { niceEnv } from 'src/utils/functions/env';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User) private userRepositoty: Repository<User>,
  ) {}

  private generateToken(userId: string) {
    const payload: AuthModel.TokenPayload = {
      sub: userId,
    };
    const token = this.jwtService.sign(payload, {
      expiresIn: niceEnv.TOKEN_DURATION,
      secret: niceEnv.JWT_SECRET,
    });
    return token;
  }

  async signUp(params: AuthModel.CreateUser) {
    const { email, name, password, role } = params;

    const userWithEmail = await this.userRepositoty.findOneBy({ email });

    if (userWithEmail) {
      throw new AppErrorConflict('Usuário com esse email já existe');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepositoty.create({
      email,
      name,
      password: hashedPassword,
      role,
    });

    await this.userRepositoty.save(user);

    const token = this.generateToken(user.id);
    return { token };
  }

  async signIn(params: AuthModel.Login) {
    const { email, password } = params;

    const user = await this.userRepositoty.findOneBy({ email });

    if (!user) {
      throw new AppErrorForbidden('Credenciais invalidas');
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      throw new AppErrorForbidden('Credenciais invalidas');
    }

    const token = this.generateToken(user.id);
    return { token };
  }

  async gatherUserInfo(userId: string) {
    const user = await this.userRepositoty.findOneBy({ id: userId });

    if (!user) {
      throw new AppErrorNotFound('Usuário não encontrado');
    }
    return user;
  }
}
