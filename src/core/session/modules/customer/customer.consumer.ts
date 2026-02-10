import { Controller, Inject } from '@nestjs/common';
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
  EventReservationCreated,
  RabbitQueue,
  type RabbitEvent,
} from 'src/utils/types/rabbit';
import { DataSource } from 'typeorm';
import { Seat } from '../../entities/seat.entity';
import { Reservation } from '../../entities/reservation.entity';
import { PaymentStatus } from '../../enums/payment.enum';
import { SeatStatus } from '../../enums/seat.enum';
import { RabbitProvider } from 'src/core/persistence/messager/rabbit.provider';
const crypto = require('crypto');

@Controller()
export class CustomerConsumer {
  private readonly MAX_PAYMENT_TIMEOUT_SECONDS = 30;
  private CACHE_PAYMENT: ReturnType<typeof groupCaches>['reservation'];

  constructor(
    private readonly redis: RedisService,
    private readonly dataSource: DataSource,
    private readonly rabbit: RabbitProvider,
  ) {
    this.CACHE_PAYMENT = groupCaches(redis).reservation;
  }

  async onModuleInit() {
    await this.prepareQueues();
    this.consumeQueues();
  }

  private async prepareQueues() {
    await this.rabbit.channel.assertExchange('reservation.events', 'direct', {
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
        'x-message-ttl': this.MAX_PAYMENT_TIMEOUT_SECONDS * 1000,
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
      RabbitQueue.RESERVATION_EXPIRED,
      async (payload) => {
        await this.handleExpiredReservation(payload as EventReservationCreated);
      },
    );

    await this.rabbit.consume(
      RabbitQueue.RESERVATION_CREATED,
      async (payload) => {
        await this.reservationCreated(payload as EventReservationCreated);
        this.rabbit.publish(RabbitQueue.RESERVATION_DELAY, payload);
      },
    );
  }

  private async handleExpiredReservation(params: EventReservationCreated) {
    const { reservationId, seatId } = params;

    console.log('TEMPO DE ESPERA ACABOU, VERIFICANDO SE RESERVA FOI PAGA');

    return await this.dataSource.transaction(async (entityManager) => {
      //Tanto para o pagamento quanto para o timeout a gente vai dar lock na reserva
      const reservation = await entityManager.findOne(Reservation, {
        where: { id: reservationId },
        lock: { mode: 'pessimistic_write' },
      });

      const seat = await entityManager.findOne(Seat, {
        where: { id: seatId },
      });

      reservation.status = PaymentStatus.CANCELLED;

      seat.status = SeatStatus.AVAILABLE;

      await entityManager.save([reservation, seat]);
    });
  }

  private async reservationCreated(params: EventReservationCreated) {
    const { reservationId, seatId } = params;

    const paymentKey = crypto.randomBytes(16).toString('base64');

    this.CACHE_PAYMENT.set(reservationId, { reservationId, paymentKey });

    console.log('-----------------------------------------------\n\n');
    console.log(
      'IT IS TIME TO PAY FOR YOUR RESERVATION, YOU HAVE 30 SECONDS BEFORE WE STOP HOLDING THE SEAT FOR YOU\n',
    );
    console.log('ID RESERVATION: ' + reservationId);
    console.log('\nPAYMENT KEY: ' + paymentKey);
    console.log('\n\n-----------------------------------------------');
  }
}
