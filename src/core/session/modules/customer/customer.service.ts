import { Inject, Injectable } from '@nestjs/common';
import {
  DataSource,
  FindOneOptions,
  FindOptions,
  FindOptionsWhere,
} from 'typeorm';
import { CustomerModel } from './customer.model';
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
import { RabbitQueue, type EventReservation } from 'src/utils/types/rabbit';
import { type Channel } from 'amqplib';
import { RabbitProvider } from 'src/core/persistence/messager/rabbit.provider';
import { PaymentStatus } from '../../enums/payment.enum';
import { SessionModel } from '../../dto/session.model';
import { MemorySessionService } from '../memory/memory-session.service';
import { ReservationModel } from '../../dto/reservation.model';
@Injectable()
export class CustomerSessionService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly rabbit: RabbitProvider,
    private readonly memory: MemorySessionService,
  ) {}

  async makePayment(params: CustomerModel.Request.ConfirmPayment) {
    const { reservationId, userId } = params;
    const { reservation, seat, session } = await this.dataSource.transaction(
      async (entityManager) => {
        const seat = await entityManager
          .getRepository(Seat)
          .createQueryBuilder('seat')
          .setLock('pessimistic_write')
          .innerJoinAndSelect('seat.currentReservation', 'reservation')
          .innerJoinAndSelect('seat.session', 'session')
          .where('reservation.id = :reservationId', { reservationId })
          .getOne();

        if (!seat.currentReservation) {
          throw new AppErrorNotFound('Reserva não foi encontrada');
        }

        if (seat.currentReservation.status != PaymentStatus.PENDING) {
          throw new AppErrorBadRequest('Reserva não está mais pendente');
        }

        seat.currentReservation.status = PaymentStatus.APPROVED;
        seat.currentReservation.payedAt = new Date();
        seat.status = SeatStatus.RESERVED;

        await entityManager.save([seat.currentReservation, seat]);
        return {
          reservation: seat.currentReservation,
          seat: seat,
          session: seat.session,
        };
      },
    );
    await this.rabbit.publish(RabbitQueue.RESERVATION_CONFIRMED, {
      reservationId,
      seatId: seat.id,
      sessionId: session.id,
    });
  }

  async bookSeat(
    body: CustomerModel.Request.BookSeat,
  ): Promise<CustomerModel.Response.Booking> {
    const { seatId, userId } = body;

    return await this.dataSource.transaction(async (entityManager) => {
      const seat = await entityManager.findOne(Seat, {
        where: { id: seatId },
        relations: {
          session: true,
        },
        relationLoadStrategy: 'query',
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
        expiresAt: addSeconds(
          new Date(),
          this.memory.MAX_PAYMENT_TIMEOUT_SECONDS,
        ),
      });

      seat.currentReservation = reservation;

      await entityManager.save([reservation, seat]);

      const payload: EventReservation = {
        seatId,
        reservationId: reservation.id,
        sessionId: seat.session.id,
      };

      this.rabbit.publish(RabbitQueue.RESERVATION_CREATED, payload);

      return {
        bookId: reservation.id,
        expiresAt: reservation.expiresAt,
      };
    });
  }

  async getSession(
    params: CustomerModel.Request.GetSession,
  ): Promise<SessionModel.Session> {
    const { sessionId } = params;

    const sessionCached = await this.memory.CACHE_SESSION.get({ sessionId });
    if (sessionCached) return sessionCached;

    const session = await this.dataSource.getRepository(Session).findOne({
      where: {
        id: sessionId,
      },
      relations: { seats: true },
    });

    if (!session) {
      throw new AppErrorNotFound('Sessão não encontrada');
    }

    await this.memory.hydrateSession(session);

    return session;
  }

  async listSessions(
    params: CustomerModel.Request.ListSessionsQuery,
  ): Promise<SessionModel.ListSessions> {
    const { limit, page } = params;

    const [sessions, total] = await Promise.all([
      this.dataSource.getRepository(Session).find({
        relations: {
          seats: true,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.dataSource.getRepository(Session).count(),
    ]);

    return new PaginatedResponseFactory({ data: sessions, limit, page, total });
  }

  async listHistory(
    params: CustomerModel.Request.ListReservationsQuery,
    userId: string,
  ): Promise<ReservationModel.ListReservations> {
    const { limit, page, status } = params;

    const queryBuilder = this.dataSource
      .getRepository(Reservation)
      .createQueryBuilder('reservation')
      .innerJoinAndSelect('reservation.seat', 'seat')
      .innerJoinAndSelect('seat.session', 'session')
      .where('reservation."userId" = :userId', { userId });

    if (status) {
      queryBuilder.where('reservation.status = :status', { status });
    }

    const [reservations, total] = await queryBuilder.getManyAndCount();

    const data = reservations.map((data) => {
      const { seat, ...reservation } = data;
      const { session, ...reservedSeat } = seat;
      return {
        ...reservation,
        reservedSeat,
        session,
      };
    });

    return new PaginatedResponseFactory({
      data,
      limit,
      page,
      total,
    });
  }
}
