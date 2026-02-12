import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  PaginatedResponseFactory,
  PaginationDto,
} from 'src/utils/types/default.pagination';
import { SeatStatus } from '../../enums/seat.enum';
import { ReservationStatus } from '../../enums/reservation.enum';
import { Transform } from 'class-transformer';

export namespace CustomerModel {
  export namespace Request {
    export class BookSeat {
      @IsString()
      @IsNotEmpty()
      seatId: string;

      @IsString()
      @IsNotEmpty()
      userId: string;
    }

    export class ConfirmPayment {
      @ApiProperty()
      reservationId: string;
    }

    export class GetSession {
      @ApiProperty({})
      sessionId: string;
    }

    export class ListSessionsQuery extends PaginationDto {}

    export class ListSalesQuery extends PaginationDto {}
  }

  export namespace Response {
    export class BookingDto {
      @ApiProperty({})
      bookId: string;

      @ApiProperty({})
      expiresAt: string;
    }
  }
}
