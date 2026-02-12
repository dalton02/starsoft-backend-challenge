import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Reservation } from '../entities/reservation.entity';
import { Sale } from '../entities/sale.entity';
import { SessionModel } from './session.model';
import { PaginatedResponseFactory } from 'src/utils/types/default.pagination';

export namespace SaleModel {
  class SeatFormatted extends OmitType(SessionModel.Seat, [
    'currentReservationId',
  ]) {}
  class SessionFormatted extends OmitType(SessionModel.Session, ['seats']) {
    seats: SeatFormatted[];
  }

  export class SaleDto {
    @ApiProperty()
    amount: number;

    @ApiProperty()
    id: string;

    @ApiProperty()
    payedAt: Date;

    @ApiProperty({ type: () => SeatFormatted })
    reservedSeat: SeatFormatted;

    @ApiProperty({ type: () => SessionFormatted })
    session: SessionFormatted;
  }

  export class ListSales extends PaginatedResponseFactory<SaleDto> {
    @ApiProperty({ type: SaleDto, isArray: true })
    data: SaleDto[];
  }
}
