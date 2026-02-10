import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Doc } from 'src/utils/documentation/doc';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { Roles, RolesGuard } from '../auth/guard/role.guard';
import { AuthModel } from '../auth/auth.model';
import { UserRole } from '../auth/enum/role.enum';

@ApiTags('Ticket/')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ticket')
@Roles(UserRole.Manager)
export class TicketController {
  @Doc({
    name: 'teste',
  })
  @Get('testelo')
  async teste() {}
}
