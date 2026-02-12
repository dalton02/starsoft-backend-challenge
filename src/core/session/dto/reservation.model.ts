import { User } from 'src/core/auth/entities/user.entity';
import { Reservation } from '../entities/reservation.entity';
import { ReservationStatus } from '../enums/reservation.enum';
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
    @ApiProperty({ type: () => SeatFormatted })
    reservedSeat: SeatFormatted;
    @ApiProperty({ type: () => SessionFormatted })
    session: SessionFormatted;
    @ApiProperty({ enum: ReservationStatus })
    status: ReservationStatus;
  }
  export class ListReservations extends PaginatedResponseFactory<ReservationDto> {
    @ApiProperty({ type: ReservationDto, isArray: true })
    data: ReservationDto[];
  }
}
