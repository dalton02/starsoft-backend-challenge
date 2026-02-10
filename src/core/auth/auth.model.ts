import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

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

  export enum Role {
    Manager = 'Manager',
    Customer = 'Customer',
  }

  export class CreateUser extends IntersectionType(Password, Email) {
    @ApiProperty({ description: '' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ enum: Role })
    @IsNotEmpty()
    @IsEnum(Role)
    role: Role;
  }

  export class Login extends IntersectionType(Password, Email) {}

  export class TokenPayload {
    sub: string;
  }

  export class UserRequest {
    id: string;
    role: Role;
  }

  export class AuthResponse {
    @ApiProperty({ description: 'Bearer Token' })
    token: string;
  }
}
