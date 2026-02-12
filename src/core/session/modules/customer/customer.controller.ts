import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
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
import { ReservationModel } from '../../dto/reservation.model';

@Controller('customer/')
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Session/Customer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
export class CustomerSessionController {
  constructor(private readonly service: CustomerSessionService) {}

  @Doc({
    name: 'List buying history',
    description: 'Shows all seats that haven been buyed by the user',
    response: ReservationModel.ListReservations,
  })
  @Get('/list-history')
  async listHistory(
    @Query() query: CustomerModel.Request.ListSalesQuery,
    @UserId() userId: string,
  ) {
    return await this.service.listHistory(query, userId);
  }

  @Doc({
    name: 'List sessions',
    response: SessionModel.ListSessions,
  })
  @Get('/list-sessions')
  async listSessions(@Query() query: CustomerModel.Request.ListSessionsQuery) {
    return await this.service.listSessions(query);
  }

  @Doc({
    name: 'Get session',
    response: SessionModel.Session,
  })
  @Get('/session/:sessionId')
  async getSession(@Param('sessionId') sessionId: string) {
    return await this.service.getSession({ sessionId });
  }

  @Doc({
    name: 'Book Seat',
    response: CustomerModel.Response.BookingDto,
  })
  @Post('/book/:seatId')
  async bookSeat(
    @Param('seatId') seatId: string,
    @UserId() userId: string,
  ): Promise<CustomerModel.Response.BookingDto> {
    return await this.service.bookSeat({ seatId, userId });
  }

  @Doc({
    name: 'Pay the reservation',
  })
  @Put('/pay/:bookId')
  async pay(@Param('bookId') reservationId: string) {
    return await this.service.makePayment({ reservationId });
  }
}
