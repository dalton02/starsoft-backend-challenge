import { Controller, Inject, Injectable, Logger } from '@nestjs/common';
import { RedisService } from 'src/core/persistence/database/redis/redis.service';
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
import { SessionModel } from '../../../dto/session.model';
import { MemorySessionService } from '../../memory/memory-session.service';
import { secondsToMilliseconds } from 'date-fns';
import { niceEnv } from 'src/utils/functions/env';
import { CustomerMessageHandler } from './customer.handlers';

@Injectable()
export class CustomerMessagerQueues {
  constructor(
    private readonly dataSource: DataSource,
    private readonly rabbit: RabbitProvider,
    private readonly handler: CustomerMessageHandler,
  ) {}

  async onModuleInit() {
    await this.prepareQueues();
    this.consumeQueues();
  }

  private async prepareQueues() {
    await this.rabbit.channel.assertExchange('reservation.events', 'direct', {
      durable: true,
    });

    await this.rabbit.channel.assertQueue(RabbitQueue.PAYMENT_CONFIRMED, {
      durable: true,
    });

    await this.rabbit.channel.assertQueue(RabbitQueue.SEAT_RELEASE, {
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
      RabbitQueue.PAYMENT_CONFIRMED,
      async (payload) => {
        await this.handler.handleConfirmedReservation(
          payload as EventReservation,
        );
      },
    );

    await this.rabbit.consume(
      RabbitQueue.RESERVATION_EXPIRED,
      async (payload) => {
        await this.handler.handleExpiredReservation(
          payload as EventReservation,
        );
      },
    );

    await this.rabbit.consume(RabbitQueue.SEAT_RELEASE, async (payload) => {
      await this.handler.handleSeatRelease(payload as EventReservation);
    });

    await this.rabbit.consume(
      RabbitQueue.RESERVATION_CREATED,
      async (payload) => {
        await this.handler.reservationCreated(payload as EventReservation);
      },
    );
  }
}
