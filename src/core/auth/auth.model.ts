import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { UserRole } from './enum/role.enum';

export namespace AuthModel {
  class Password {
    @ApiProperty({})
    @IsNotEmpty()
    @IsStrongPassword()
    password: string;
  }

  class Email {
    @ApiProperty({})
    @IsNotEmpty()
    @IsEmail()
    email: string;
  }

  export class CreateUser extends IntersectionType(Password, Email) {
    @ApiProperty({ description: '' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ enum: UserRole })
    @IsNotEmpty()
    @IsEnum(UserRole)
    role: UserRole;
  }

  export class Login extends IntersectionType(Password, Email) {}

  export class TokenPayload {
    sub: string;
  }

  export class UserRequest {
    id: string;
    role: UserRole;
  }

  export class AuthResponse {
    @ApiProperty({ description: 'Bearer Token' })
    token: string;
  }
}
