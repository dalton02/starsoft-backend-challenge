import { Controller, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserRole } from 'src/core/auth/enum/role.enum';
import { JwtAuthGuard } from 'src/core/auth/guard/jwt.guard';
import { Roles, RolesGuard } from 'src/core/auth/guard/role.guard';
import { Doc } from 'src/utils/documentation/doc';
import { CustomerSessionService } from './customer.service';
import { UserId } from 'src/utils/decorators/user-id.decorator';
import { CustomerSessionModel } from './customer.model';

@Controller('customer-session/')
@ApiTags('Session/Customer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
export class CustomerSessionController {
  constructor(private readonly service: CustomerSessionService) {}

  @Doc({
    name: 'List sessions',
    response: CustomerSessionModel.ResponseListSession,
  })
  @Post('/list')
  async listSessions(@Query() query: CustomerSessionModel.ListSessionsQuery) {
    return await this.service.listSessions(query);
  }
  @Doc({
    name: 'Book Seat',
  })
  @Post('/book/:seatId')
  async bookSeat(@Param('seatId') seatId: string, @UserId() userId: string) {
    return await this.service.bookSeat({ seatId, userId });
  }
}
