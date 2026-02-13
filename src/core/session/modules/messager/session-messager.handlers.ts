import { Controller, Inject, Injectable, Logger } from '@nestjs/common';
import {
  EventReservation,
  RabbitExchange,
  RabbitQueue,
} from 'src/utils/types/rabbit';
import { DataSource } from 'typeorm';
import { Seat } from '../../entities/seat.entity';
import { Reservation } from '../../entities/reservation.entity';
import { ReservationStatus } from '../../enums/reservation.enum';
import { SeatStatus } from '../../enums/seat.enum';
import { RabbitProvider } from 'src/core/persistence/messager/rabbit.provider';
import { MemorySessionService } from '../memory/memory-session.service';

@Injectable()
export class SessionMessageHandler {
  constructor(
    private readonly dataSource: DataSource,
    private readonly rabbit: RabbitProvider,
    private readonly memory: MemorySessionService,
  ) {}

  async handleConfirmedReservation(params: EventReservation) {
    const { reservationId, seatId, sessionId } = params;

    console.log('-----------------------------------------------\n\n');
    console.log('YOUR RESERVATION IS VALID!!!');
    console.log('\n\n-----------------------------------------------');

    await this.memory.updateSeat({
      sessionId,
      seatId: seatId,
      seat: { status: SeatStatus.RESERVED },
    });
  }

  async handleSeatRelease(params: EventReservation) {
    const { reservationId, seatId, sessionId } = params;

    console.log('-----------------------------------------------\n\n');
    console.log('RELEASING SEAT ', seatId, ' FOR OTHER USERS');
    console.log('\n\n-----------------------------------------------');

    await this.memory.updateSeat({
      sessionId,
      seatId,
      seat: {
        currentReservationId: null,
        status: SeatStatus.AVAILABLE,
      },
    });
  }

  async handleTimeoutReservation(params: EventReservation) {
    const { reservationId, seatId, sessionId } = params;

    console.log('-----------------------------------------------\n\n');
    console.log('TTL EXPIRED, CHECKING YOUR RESERVATION');
    console.log('\n\n-----------------------------------------------');

    const { reservation, seat } = await this.dataSource.transaction(
      async (entityManager) => {
        const seat = await entityManager.findOne(Seat, {
          where: { id: seatId },
          relations: {
            currentReservation: true,
          },
          relationLoadStrategy: 'query',
          lock: { mode: 'pessimistic_write' },
        });

        const reservation = await entityManager.findOne(Reservation, {
          where: { id: reservationId },
        });

        if (reservation.status !== ReservationStatus.PENDING) {
          return { reservation, seat };
        }

        reservation.status = ReservationStatus.CANCELLED;
        seat.status = SeatStatus.AVAILABLE;
        seat.currentReservation = null;

        await entityManager.save([reservation, seat]);
        return { reservation, seat };
      },
    );

    if (reservation.status === ReservationStatus.CANCELLED) {
      await this.rabbit.publish(
        RabbitExchange.RESERVATION_EVENTS,
        RabbitQueue.SEAT_RELEASE,
        params,
      );
    }
  }

  async handleReservationCreated(payload: EventReservation) {
    const { reservationId, seatId, sessionId } = payload;

    console.log('-----------------------------------------------\n\n');
    console.log(
      'IT IS TIME TO PAY FOR YOUR RESERVATION, YOU HAVE 30 SECONDS BEFORE WE STOP HOLDING THE SEAT FOR YOU\n',
    );
    console.log('\n\n-----------------------------------------------');

    await this.memory.updateSeat({
      sessionId,
      seatId: seatId,
      seat: { status: SeatStatus.HOLDING },
    });

    await this.rabbit.publish(
      RabbitExchange.RESERVATION_EVENTS,
      RabbitQueue.RESERVATION_DELAY,
      payload,
    );
  }
}
