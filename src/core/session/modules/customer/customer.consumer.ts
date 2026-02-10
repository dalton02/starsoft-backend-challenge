import { Controller, Inject, Injectable } from '@nestjs/common';
import {
  ClientProxy,
  EventPattern,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import { RedisService } from 'src/core/persistence/database/redis/redis.service';
import { groupCaches } from 'src/utils/functions/cache';
import { wait } from 'src/utils/functions/time';
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
import { CustomerModel } from './customer.model';
import { SessionModel } from '../../dto/session.model';
import { MemorySessionService } from '../memory/memory-session.service';
const crypto = require('crypto');

@Injectable()
export class CustomerConsumer {
  private CACHE_SESSION: ReturnType<typeof groupCaches>['session'];
  private CACHE_SEAT: ReturnType<typeof groupCaches>['seat'];

  constructor(
    private readonly redisService: RedisService,
    private readonly dataSource: DataSource,
    private readonly rabbit: RabbitProvider,
    private readonly memory: MemorySessionService,
  ) {
    this.CACHE_SESSION = groupCaches(redisService).session;
    this.CACHE_SEAT = groupCaches(redisService).seat;
  }

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
        'x-message-ttl': SessionModel.MAX_PAYMENT_TIMEOUT_SECONDS * 1000,
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

    const seat = await this.CACHE_SEAT.get({ seatId, sessionId });

    if (seat) {
      await this.memory.hydrateSeat({
        sessionId,
        seat: { ...seat, status: SeatStatus.RESERVED },
      });
    }
  }

  private async handleExpiredReservation(params: EventReservation) {
    const { reservationId, seatId, sessionId } = params;

    const { reservation, seat } = await this.dataSource.transaction(
      async (entityManager) => {
        //Tanto para o pagamento quanto para o timeout a gente vai dar lock na reserva
        const reservation = await entityManager.findOne(Reservation, {
          where: { id: reservationId },
          lock: { mode: 'pessimistic_write' },
        });

        if (reservation.status !== PaymentStatus.PENDING) {
          return;
        }

        const seat = await entityManager.findOne(Seat, {
          where: { id: seatId },
        });

        reservation.status = PaymentStatus.CANCELLED;
        seat.status = SeatStatus.AVAILABLE;

        await entityManager.save([reservation, seat]);
        return { reservation, seat };
      },
    );
    await this.memory.hydrateSeat({ sessionId, seat });
  }

  private async reservationCreated(params: EventReservation) {
    const { reservationId, seatId, sessionId } = params;

    const seat = await this.CACHE_SEAT.get({ seatId, sessionId });

    if (seat) {
      await this.memory.hydrateSeat({
        sessionId,
        seat: { ...seat, status: SeatStatus.HOLDING },
      });
    }

    console.log('-----------------------------------------------\n\n');
    console.log(
      'IT IS TIME TO PAY FOR YOUR RESERVATION, YOU HAVE 30 SECONDS BEFORE WE STOP HOLDING THE SEAT FOR YOU\n',
    );
    console.log('ID RESERVATION: ' + reservationId);
    console.log('\n\n-----------------------------------------------');
  }
}
