import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export namespace CustomerSessionModel {
  export class ReservSeat {
    seatId: string;
    userId: string;
  }

  export class BodyPayForSeat {
    @IsNumber()
    @IsNotEmpty()
    chanceOfFailure: number;
  }

  export class PayForSeat extends BodyPayForSeat {
    reservationId: string;
    userId: string;
  }
}
