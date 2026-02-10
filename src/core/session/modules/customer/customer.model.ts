import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import {
  PaginatedResponseFactory,
  PaginationDto,
} from 'src/utils/types/default.pagination';
import { Session } from '../../entities/session.entity';
import { Seat } from '../../entities/seat.entity';
import { SeatStatus } from '../../enums/seat.enum';

export namespace CustomerSessionModel {
  export class BookSeatRequest {
    seatId: string;
    userId: string;
  }

  export class BodyPayForSeat {
    @IsNumber()
    @IsNotEmpty()
    chanceOfFailure: number;
  }

  export class ConfirmPayment extends BodyPayForSeat {
    reservationId: string;
    userId: string;
  }

  export class ListSessionsQuery extends PaginationDto {}

  class SeatFromList {
    @ApiProperty({})
    id: string;
    @ApiProperty({})
    placement: string;
    @ApiProperty({ enum: SeatStatus })
    status: SeatStatus;
  }
  class SessionFromList {
    @ApiProperty({})
    duration: number;
    @ApiProperty({})
    id: string;
    @ApiProperty({})
    movie: string;
    @ApiProperty({})
    price: number;
    @ApiProperty({})
    room: string;
    @ApiProperty({ type: SeatFromList, isArray: true })
    seats: SeatFromList[];
    @ApiProperty({})
    showtime: Date;
  }

  export class ResponseListSession extends PaginatedResponseFactory<SessionFromList> {
    @ApiProperty({ type: SessionFromList, isArray: true })
    data: SessionFromList[];
  }
}
