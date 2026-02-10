import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserRole } from 'src/core/auth/enum/role.enum';
import { JwtAuthGuard } from 'src/core/auth/guard/jwt.guard';
import { Roles, RolesGuard } from 'src/core/auth/guard/role.guard';
import { Doc } from 'src/utils/documentation/doc';
import { CustomerSessionService } from './customer.service';
import { UserId } from 'src/utils/decorators/user-id.decorator';
import { CustomerModel } from './customer.model';
import { SessionModel } from '../../dto/session.model';

@Controller('customer-session/')
@ApiTags('Session/Customer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
export class CustomerSessionController {
  constructor(private readonly service: CustomerSessionService) {}

  @Doc({
    name: 'List sessions',
    response: SessionModel.ListSessions,
  })
  @Post('/list')
  async listSessions(@Query() query: CustomerModel.Request.ListSessionsQuery) {
    return await this.service.listSessions(query);
  }

  @Doc({
    name: 'Get session',
    response: CustomerModel.Request.GetSession,
  })
  @Get('/session/:sessionId')
  async getSession(@Param('sessionId') sessionId: string) {
    return await this.service.getSession({ sessionId });
  }

  @Doc({
    name: 'Book Seat',
    response: CustomerModel.Response.Booking,
  })
  @Post('/book/:seatId')
  async bookSeat(@Param('seatId') seatId: string, @UserId() userId: string) {
    return await this.service.bookSeat({ seatId, userId });
  }

  @Doc({
    name: 'Pay the reservation',
  })
  @Put('/pay/:reservationId')
  async pay(
    @Param('reservationId') reservationId: string,
    @UserId() userId: string,
  ) {
    return await this.service.makePayment({ userId, reservationId });
  }
}
