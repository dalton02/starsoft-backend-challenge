import { ApiProperty } from '@nestjs/swagger';
import { SeatStatus } from '../enums/seat.enum';
import { PaginatedResponseFactory } from 'src/utils/types/default.pagination';

export namespace SessionModel {
  export class Seat {
    @ApiProperty()
    id: string;

    @ApiProperty()
    placement: string;

    @ApiProperty({ enum: SeatStatus })
    status: SeatStatus;
  }

  export class Session {
    @ApiProperty()
    id: string;

    @ApiProperty()
    movie: string;

    @ApiProperty()
    duration: number;

    @ApiProperty()
    price: number;

    @ApiProperty()
    room: string;

    @ApiProperty({ type: Seat, isArray: true })
    seats: Seat[];

    @ApiProperty()
    showtime: Date;
  }

  export class ListSessions extends PaginatedResponseFactory<Session> {
    @ApiProperty({ type: Session, isArray: true })
    data: Session[];
  }
}
