import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Doc } from 'src/utils/documentation/doc';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { Roles, RolesGuard } from '../auth/guard/role.guard';
import { AuthModel } from '../auth/auth.model';

@ApiTags('Ticket/')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ticket')
@Roles(AuthModel.Role.Manager)
export class TicketController {
  @Doc({
    name: 'teste',
  })
  @Get('teste')
  async teste() {}
}
