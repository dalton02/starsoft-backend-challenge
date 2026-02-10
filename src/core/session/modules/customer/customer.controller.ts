import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserRole } from 'src/core/auth/enum/role.enum';
import { JwtAuthGuard } from 'src/core/auth/guard/jwt.guard';
import { Roles, RolesGuard } from 'src/core/auth/guard/role.guard';
import { Doc } from 'src/utils/documentation/doc';
import { CustomerSessionService } from './customer.service';
import { UserId } from 'src/utils/decorators/user-id.decorator';

@Controller('customer-session/')
@ApiTags('Session/Customer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
export class CustomerSessionController {
  constructor(private readonly service: CustomerSessionService) {}

  @Doc({
    name: 'Book Seat',
  })
  @Post(':seatId')
  async bookSeat(@Param('seatId') seatId: string, @UserId() userId: string) {
    return await this.service.reservSeat({ seatId, userId });
  }
}
