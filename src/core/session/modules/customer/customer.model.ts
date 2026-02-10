import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import {
  PaginatedResponseFactory,
  PaginationDto,
} from 'src/utils/types/default.pagination';
import { SeatStatus } from '../../enums/seat.enum';

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

      @ApiProperty()
      userId: string;
    }

    export class GetSession {
      @ApiProperty({})
      sessionId: string;
    }

    export class ListSessionsQuery extends PaginationDto {}
  }

  export namespace Response {
    export class Booking {
      @ApiProperty({})
      bookId: string;
      @ApiProperty({})
      expiresAt: Date;
    }
  }
}
