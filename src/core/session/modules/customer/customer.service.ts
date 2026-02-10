import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CustomerSessionModel } from './customer.model';
import { Seat } from '../../entities/seat.entity';
import { SeatStatus } from '../../enums/seat.enum';
import {
  AppErrorBadRequest,
  AppErrorNotFound,
} from 'src/utils/errors/app-errors';
import { Reservation } from '../../entities/reservation.entity';
import { Session } from '../../entities/session.entity';
import { PaginatedResponseFactory } from 'src/utils/types/default.pagination';
import { addSeconds } from 'date-fns';
import { ClientKafka, ClientProxy } from '@nestjs/microservices';
import {
  RabbitQueue,
  type EventReservationCreated,
} from 'src/utils/types/rabbit';
import { type Channel } from 'amqplib';
import { RabbitProvider } from 'src/core/persistence/messager/rabbit.provider';
import { groupCaches } from 'src/utils/functions/cache';
import { RedisService } from 'src/core/persistence/database/redis/redis.service';
@Injectable()
export class CustomerSessionService {
  private CACHE_PAYMENT: ReturnType<typeof groupCaches>['reservation'];

  constructor(
    private readonly redis: RedisService,
    private readonly dataSource: DataSource,
    private readonly rabbit: RabbitProvider,
  ) {
    this.CACHE_PAYMENT = groupCaches(redis).reservation;
  }

  async makePayment() {}

  async bookSeat(body: CustomerSessionModel.BookSeatRequest) {
    const { seatId, userId } = body;

    return await this.dataSource.transaction(async (entityManager) => {
      const seat = await entityManager.findOne(Seat, {
        where: { id: seatId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!seat) {
        throw new AppErrorNotFound('Assento não encontrado');
      }

      if (seat.status !== SeatStatus.AVAILABLE) {
        throw new AppErrorBadRequest('Assento não está disponivel');
      }

      seat.status = SeatStatus.HOLDING;

      const reservation = entityManager.create(Reservation, {
        user: { id: userId },
        seat: { id: seatId },
      });

      await entityManager.save([reservation, seat]);

      const payload: EventReservationCreated = {
        seatId,
        reservationId: reservation.id,
      };

      this.rabbit.publish(RabbitQueue.RESERVATION_CREATED, payload);
    });
  }

  async listSessions(
    params: CustomerSessionModel.ListSessionsQuery,
  ): Promise<CustomerSessionModel.ResponseListSession> {
    const { limit, page } = params;

    const [sessions, total] = await Promise.all([
      this.dataSource.getRepository(Session).find({
        relations: { seats: true },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.dataSource.getRepository(Session).count(),
    ]);

    return new PaginatedResponseFactory({ data: sessions, limit, page, total });
  }
}
