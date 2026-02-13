import { Controller, Inject, Injectable, Logger } from '@nestjs/common';
import { RedisService } from 'src/core/persistence/database/redis/redis.service';
import {
  EventReservation,
  RabbitExchange,
  RabbitQueue,
  type RabbitEvent,
} from 'src/utils/types/rabbit';
import { DataSource } from 'typeorm';
import { RabbitProvider } from 'src/core/persistence/messager/rabbit.provider';
import { secondsToMilliseconds } from 'date-fns';
import { niceEnv } from 'src/utils/functions/env';
import { SessionMessageHandler } from './session-messager.handlers';

@Injectable()
export class SessionMessagerQueues {
  constructor(
    private readonly rabbit: RabbitProvider,
    private readonly handler: SessionMessageHandler,
  ) {}

  async onModuleInit() {
    await this.prepareQueues();
    this.consumeQueues();
  }

  private async prepareQueues() {
    await this.rabbit.channel.assertExchange(
      RabbitExchange.RESERVATION_EVENTS,
      'x-delayed-message',
      {
        durable: true,
        arguments: {
          'x-delayed-type': 'direct',
        },
      },
    );

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
        'x-dead-letter-exchange': RabbitExchange.RESERVATION_EVENTS,
        'x-dead-letter-routing-key': RabbitQueue.RESERVATION_EXPIRED,
      },
    });

    await this.rabbit.channel.bindQueue(
      RabbitQueue.RESERVATION_EXPIRED,
      RabbitExchange.RESERVATION_EVENTS,
      RabbitQueue.RESERVATION_EXPIRED,
    );

    await this.rabbit.channel.bindQueue(
      RabbitQueue.RESERVATION_CREATED,
      RabbitExchange.RESERVATION_EVENTS,
      RabbitQueue.RESERVATION_CREATED,
    );
    await this.rabbit.channel.bindQueue(
      RabbitQueue.RESERVATION_DELAY,
      RabbitExchange.RESERVATION_EVENTS,
      RabbitQueue.RESERVATION_DELAY,
    );

    await this.rabbit.channel.bindQueue(
      RabbitQueue.PAYMENT_CONFIRMED,
      RabbitExchange.RESERVATION_EVENTS,
      RabbitQueue.PAYMENT_CONFIRMED,
    );

    await this.rabbit.channel.bindQueue(
      RabbitQueue.SEAT_RELEASE,
      RabbitExchange.RESERVATION_EVENTS,
      RabbitQueue.SEAT_RELEASE,
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
        await this.handler.handleTimeoutReservation(
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
        await this.handler.handleReservationCreated(
          payload as EventReservation,
        );
      },
    );
  }
}
