import { Controller, Inject, Injectable, Logger } from '@nestjs/common';
import {
  EventReservation,
  RabbitQueue,
  type RabbitEvent,
} from 'src/utils/types/rabbit';
import { DataSource } from 'typeorm';
import { Seat } from '../../../entities/seat.entity';
import { Reservation } from '../../../entities/reservation.entity';
import { ReservationStatus } from '../../../enums/reservation.enum';
import { SeatStatus } from '../../../enums/seat.enum';
import { RabbitProvider } from 'src/core/persistence/messager/rabbit.provider';
import { MemorySessionService } from '../../memory/memory-session.service';
import { RetryableError } from 'src/utils/errors/custom-errors';

@Injectable()
export class CustomerMessageHandler {
  constructor(
    private readonly dataSource: DataSource,
    private readonly rabbit: RabbitProvider,
    private readonly memory: MemorySessionService,
  ) {}

  async handleConfirmedReservation(params: EventReservation) {
    const { reservationId, seatId, sessionId } = params;

    let session = await this.memory.CACHE_SESSION.get({ sessionId });

    if (!session) {
      await this.memory.reloadSessionFromDB(sessionId);
      return;
    }

    const seatReserved = session.seats.find((seat) => seat.id === seatId);

    if (!seatReserved) {
      throw new Error('Seat does not exist');
    }

    await this.memory.updateSeat({
      sessionId,
      seatId: seatReserved.id,
      seat: { status: SeatStatus.RESERVED },
    });
  }

  async handleSeatRelease(params: EventReservation) {
    const { reservationId, seatId, sessionId } = params;

    console.log('-----------------------------------------------\n\n');
    console.log('LIBERANDO ASSENTO PARA OUTRAS PESSOAS COMPRAREM');
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

  async handleExpiredReservation(params: EventReservation) {
    const { reservationId, seatId, sessionId } = params;

    console.log('-----------------------------------------------\n\n');
    console.log('TEMPO LIMITE ESTOURADO, VERIFICANDO RESERVA');
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

    if (reservation.status === ReservationStatus.APPROVED) {
      console.log('-----------------------------------------------\n\n');
      console.log('SUA RESERVA ESTÁ CONFIRMADA AQUI, PARABÉNS');
      console.log('\n\n-----------------------------------------------');
    }

    if (reservation.status === ReservationStatus.CANCELLED) {
      await this.rabbit.publish(RabbitQueue.SEAT_RELEASE, params);
    }
  }

  async reservationCreated(payload: EventReservation) {
    const { reservationId, seatId, sessionId } = payload;

    console.log('-----------------------------------------------\n\n');
    console.log(
      'IT IS TIME TO PAY FOR YOUR RESERVATION, YOU HAVE 30 SECONDS BEFORE WE STOP HOLDING THE SEAT FOR YOU\n',
    );
    console.log('ID RESERVATION: ' + reservationId);
    console.log('\n\n-----------------------------------------------');

    let session = await this.memory.CACHE_SESSION.get({ sessionId });
    if (!session) {
      await this.memory.reloadSessionFromDB(sessionId);
    } else {
      const seatReserved = session.seats.find((seat) => seat.id === seatId);

      if (!seatReserved) {
        throw new Error('Seat does not exist');
      }

      await this.memory.updateSeat({
        sessionId,
        seatId: seatReserved.id,
        seat: { status: SeatStatus.HOLDING },
      });
    }

    await this.rabbit.publish(RabbitQueue.RESERVATION_DELAY, payload);
  }
}
