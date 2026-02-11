import { Controller, Inject, Injectable, Logger } from '@nestjs/common';
import { RedisService } from 'src/core/persistence/database/redis/redis.service';
import {
  EventReservation,
  RabbitQueue,
  type RabbitEvent,
} from 'src/utils/types/rabbit';
import { DataSource } from 'typeorm';
import { Seat } from '../../entities/seat.entity';
import { Reservation } from '../../entities/reservation.entity';
import { PaymentStatus } from '../../enums/payment.enum';
import { SeatStatus } from '../../enums/seat.enum';
import { RabbitProvider } from 'src/core/persistence/messager/rabbit.provider';
import { SessionModel } from '../../dto/session.model';
import { MemorySessionService } from '../memory/memory-session.service';
import { secondsToMilliseconds } from 'date-fns';
import { niceEnv } from 'src/utils/functions/env';

@Injectable()
export class CustomerConsumer {
  constructor(
    private readonly dataSource: DataSource,
    private readonly rabbit: RabbitProvider,
    private readonly memory: MemorySessionService,
  ) {}

  async onModuleInit() {
    await this.prepareQueues();
    this.consumeQueues();
  }

  private async prepareQueues() {
    await this.rabbit.channel.assertExchange('reservation.events', 'direct', {
      durable: true,
    });

    await this.rabbit.channel.assertQueue(RabbitQueue.RESERVATION_CONFIRMED, {
      durable: true,
    });

    await this.rabbit.channel.assertQueue(RabbitQueue.RESERVATION_CREATED, {
      durable: true,
    });

    await this.rabbit.channel.assertQueue(RabbitQueue.RESERVATION_EXPIRED, {
      durable: true,
    });

    await this.rabbit.channel.assertQueue(RabbitQueue.RESERVATION_DELAY, {
      durable: true,
      arguments: {
        'x-message-ttl': secondsToMilliseconds(
          niceEnv.MAX_PAYMENT_TIMEOUT_SECONDS,
        ),
        'x-dead-letter-exchange': 'reservation.events',
        'x-dead-letter-routing-key': RabbitQueue.RESERVATION_EXPIRED,
      },
    });

    await this.rabbit.channel.bindQueue(
      RabbitQueue.RESERVATION_EXPIRED,
      'reservation.events',
      RabbitQueue.RESERVATION_EXPIRED,
    );
  }

  private async consumeQueues() {
    await this.rabbit.consume(
      RabbitQueue.RESERVATION_CONFIRMED,
      async (payload) => {
        await this.handleConfirmedReservation(payload as EventReservation);
      },
    );

    await this.rabbit.consume(
      RabbitQueue.RESERVATION_EXPIRED,
      async (payload) => {
        await this.handleExpiredReservation(payload as EventReservation);
      },
    );

    await this.rabbit.consume(
      RabbitQueue.RESERVATION_CREATED,
      async (payload) => {
        await this.reservationCreated(payload as EventReservation);
        this.rabbit.publish(RabbitQueue.RESERVATION_DELAY, payload);
      },
    );
  }

  private async handleConfirmedReservation(params: EventReservation) {
    const { reservationId, seatId, sessionId } = params;

    let session = await this.memory.CACHE_SESSION.get({ sessionId });
    if (!session) session = await this.memory.hydrateFromDB(sessionId); //Possivel erro de não existe no banc

    const seatReserved = session.seats.find((seat) => seat.id === seatId);

    if (!seatReserved) {
      throw new Error('Seat does not exist');
    }
    await this.memory.hydrateSeat({
      sessionId,
      seat: { ...seatReserved, status: SeatStatus.RESERVED },
    });
  }

  private async handleExpiredReservation(params: EventReservation) {
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

        if (reservation.status !== PaymentStatus.PENDING) {
          return { reservation, seat };
        }

        reservation.status = PaymentStatus.CANCELLED;
        seat.status = SeatStatus.AVAILABLE;
        seat.currentReservation = null;

        await entityManager.save([reservation, seat]);
        return { reservation, seat };
      },
    );
    await this.memory.hydrateSeat({
      sessionId,
      seat: {
        ...seat,
        currentReservationId: seat.currentReservation?.id ?? null,
      },
    });
  }

  private async reservationCreated(params: EventReservation) {
    const { reservationId, seatId, sessionId } = params;

    try {
      console.log('-----------------------------------------------\n\n');
      console.log(
        'IT IS TIME TO PAY FOR YOUR RESERVATION, YOU HAVE 30 SECONDS BEFORE WE STOP HOLDING THE SEAT FOR YOU\n',
      );
      console.log('ID RESERVATION: ' + reservationId);
      console.log('\n\n-----------------------------------------------');

      let session = await this.memory.CACHE_SESSION.get({ sessionId });
      if (!session) session = await this.memory.hydrateFromDB(sessionId); //Possivel erro de não existe no banc

      const seatReserved = session.seats.find((seat) => seat.id === seatId);

      if (!seatReserved) {
        throw new Error('Seat does not exist');
      }

      await this.memory.hydrateSeat({
        sessionId,
        seat: { ...seatReserved, status: SeatStatus.HOLDING },
      });
    } catch (err) {
      console.warn(err);
    }
  }
}
