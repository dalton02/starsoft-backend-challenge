import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guard/jwt.guard';
import { JwtStrategy } from './guard/jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: Number(process.env.BEARER_TOKEN_DURATION) },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [AuthService, JwtAuthGuard, JwtStrategy],
  controllers: [AuthController],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
