import { User } from 'src/core/auth/entities/user.entity';
import { Reservation } from '../entities/reservation.entity';
import { PaymentStatus } from '../enums/payment.enum';
import { SessionModel } from './session.model';
import { PaginatedResponseFactory } from 'src/utils/types/default.pagination';
import { ApiProperty, OmitType } from '@nestjs/swagger';

export namespace ReservationModel {
  class SeatFormatted extends OmitType(SessionModel.Seat, [
    'currentReservationId',
  ]) {}
  class SessionFormatted extends OmitType(SessionModel.Session, ['seats']) {
    seats: SeatFormatted[];
  }

  export class ReservationDto {
    @ApiProperty({})
    createdAt: Date;
    @ApiProperty({})
    expiresAt: Date;
    @ApiProperty({})
    id: string;
    @ApiProperty({})
    payedAt: Date;
    @ApiProperty({ type: () => SeatFormatted })
    reservedSeat: SeatFormatted;
    @ApiProperty({ type: () => SessionFormatted })
    session: SessionFormatted;
    @ApiProperty({ enum: PaymentStatus })
    status: PaymentStatus;
  }
  export class ListReservations extends PaginatedResponseFactory<ReservationDto> {
    @ApiProperty({ type: ReservationDto, isArray: true })
    data: ReservationDto[];
  }
}
