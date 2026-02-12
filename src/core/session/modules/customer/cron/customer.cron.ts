import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RabbitProvider } from 'src/core/persistence/messager/rabbit.provider';
import { Seat } from 'src/core/session/entities/seat.entity';
import { SeatStatus } from 'src/core/session/enums/seat.enum';
import { RabbitQueue } from 'src/utils/types/rabbit';
import { DataSource } from 'typeorm';

@Injectable()
export class CustomerCronJobs {
  constructor(
    private readonly rabbit: RabbitProvider,
    private readonly dataSource: DataSource,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handle() {
    const result = await this.dataSource.transaction(async (tx) => {
      const data: {
        id: string;
        sessionId: SeatStatus;
        reservationId: string;
      }[] = await tx.query(
        `SELECT seat.id,seat.session_id as sessionId,seat.current_reservation_id as reservationId FROM seat 
             INNER JOIN reservation ON seat.current_reservation_id = reservation.id
             WHERE seat.status = 'HOLDING' AND reservation."expiresAt" < CURRENT_TIMESTAMP
             FOR UPDATE SKIP LOCKED
             `,
      );

      if (data.length === 0) return [];

      const seatIds = data.map((d) => d.id);

      const reservationIds = data.map((d) => d.reservationId);

      await tx.query(
        `UPDATE seat SET status = 'AVAILABLE', current_reservation_id = NULL WHERE id = ANY($1::text[])`,
        [seatIds],
      );

      await tx.query(
        `UPDATE reservation SET status = 'CANCELLED' WHERE id = ANY($1::text[])`,
        [reservationIds],
      );

      return data;
    });

    result.forEach((seat) => {
      this.rabbit.publish(RabbitQueue.SEAT_RELEASE, {
        reservationId: seat.reservationId,
        seatId: seat.id,
        sessionId: seat.sessionId,
      });
    });

    return result.length;
  }
}
