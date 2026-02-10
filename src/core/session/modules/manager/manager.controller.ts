import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ManagerSessionService } from './manager.service';
import { Doc } from 'src/utils/documentation/doc';
import { ManagerSessionModel } from './manager.model';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/core/auth/guard/jwt.guard';
import { Roles, RolesGuard } from 'src/core/auth/guard/role.guard';
import { UserRole } from 'src/core/auth/enum/role.enum';

@Controller('manager-session')
@ApiTags('Session/Manager')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MANAGER)
export class ManagerSessionController {
  constructor(private readonly service: ManagerSessionService) {}

  @Doc({
    name: 'Create Session',
    response: ManagerSessionModel.ResponseSession,
  })
  @Post('/create')
  async create(@Body() body: ManagerSessionModel.CreateSession) {
    return await this.service.create(body);
  }
}
