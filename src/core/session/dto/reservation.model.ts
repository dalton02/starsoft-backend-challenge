import { User } from 'src/core/auth/entities/user.entity';
import { Reservation } from '../entities/reservation.entity';
import { PaymentStatus } from '../enums/payment.enum';
import { SessionModel } from './session.model';
import { PaginatedResponseFactory } from 'src/utils/types/default.pagination';
import { ApiProperty } from '@nestjs/swagger';

export namespace ReservationModel {
  export class ReservationDto {
    @ApiProperty({})
    createdAt: Date;
    @ApiProperty({})
    expiresAt: Date;
    @ApiProperty({})
    id: string;
    @ApiProperty({})
    payedAt: Date;
    @ApiProperty({ type: () => SessionModel.Seat })
    reservedSeat: SessionModel.Seat;
    @ApiProperty({ type: () => SessionModel.Session })
    session: SessionModel.Session;
    @ApiProperty({ enum: PaymentStatus })
    status: PaymentStatus;
  }
  export class ListReservations extends PaginatedResponseFactory<ReservationDto> {
    @ApiProperty({ type: ReservationDto, isArray: true })
    data: ReservationDto[];
  }
}
