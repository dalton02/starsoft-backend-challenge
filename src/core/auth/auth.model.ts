import { ApiProperty, IntersectionType, OmitType } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { UserRole } from './enum/role.enum';

export namespace AuthModel {
  class PasswordDto {
    @ApiProperty({ example: '@Senha123' })
    @IsNotEmpty()
    @IsStrongPassword()
    password: string;
  }

  class EmailDto {
    @ApiProperty({ example: 'manager@email.com' })
    @IsNotEmpty()
    @IsEmail()
    email: string;
  }

  export class User extends IntersectionType(PasswordDto, EmailDto) {
    @ApiProperty({})
    id: string;

    @ApiProperty({ description: '', example: 'Dalton Gomes' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ enum: UserRole, example: UserRole.MANAGER })
    @IsNotEmpty()
    @IsEnum(UserRole)
    role: UserRole;
  }

  export class TokenPayload {
    sub: string;
  }

  export class UserRequest {
    id: string;
    role: UserRole;
  }

  export namespace Request {
    export class CreateUser extends OmitType(User, ['id']) {}
    export class Login extends IntersectionType(PasswordDto, EmailDto) {}
  }

  export namespace Response {
    export class Auth {
      @ApiProperty({ description: 'Bearer Token' })
      token: string;
    }
  }
}
