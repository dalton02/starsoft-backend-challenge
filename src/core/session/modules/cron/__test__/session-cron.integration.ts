import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { RedisService } from 'src/core/persistence/database/redis/redis.service';
import { SeatStatus } from 'src/core/session/enums/seat.enum';
import { RabbitProvider } from 'src/core/persistence/messager/rabbit.provider';
import { User } from 'src/core/auth/entities/user.entity';
import { Session } from 'src/core/session/entities/session.entity';
import { MemorySessionService } from '../../memory/memory-session.service';
import { Seat } from 'src/core/session/entities/seat.entity';

import dataSource from 'src/database.source';
import { addSeconds, subSeconds } from 'date-fns';
import { Reservation } from 'src/core/session/entities/reservation.entity';
import { SessionCronService } from '../../cron/session-cron.service';
import { MockCustomer } from '../../customer/__mocks__/customer.mocks';
import { CustomerServiceUnitMocks } from '../../customer/__mocks__/functions.mocks';

//Testes não envolvem a mensageria em si devido a serem operações assicronas demoradas
describe('Session CronJOB Integration Test', () => {
  let cronJobService: SessionCronService;
  let datasource: DataSource;

  async function mock() {
    await datasource.transaction(async (tx) => {
      const { duration, id, movie, price, room, showtime } =
        MockCustomer.session;

      const userOne = tx.getRepository(User).create(MockCustomer.userOne);
      const userTwo = tx.getRepository(User).create(MockCustomer.userTwo);
      const session = tx.getRepository(Session).create({
        duration,
        id,
        movie,
        price,
        room,
        showtime,
      });
      const seats = MockCustomer.session.seats.map((seat) => {
        return tx.getRepository(Seat).create({
          id: seat.id,
          placement: seat.placement,
          session: { id },
          status: seat.status,
        });
      });

      await tx.save([userOne, userTwo, session, ...seats]);
    });
  }

  async function destroyMocks() {
    await datasource.transaction(async (tx) => {
      await tx.delete(Seat, { id: MockCustomer.seat.id });
      await tx.delete(Session, { id: MockCustomer.session.id });
      await tx.delete(User, { id: MockCustomer.userOne.id });
      await tx.delete(User, { id: MockCustomer.userTwo.id });
    });
  }

  beforeAll(async () => {
    await dataSource.initialize();
    const module = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: RabbitProvider,
          useValue: CustomerServiceUnitMocks.Rabbit,
        },
        MemorySessionService,
        {
          provide: DataSource,
          useValue: dataSource,
        },
        SessionCronService,
      ],
    }).compile();

    datasource = module.get(DataSource);
    cronJobService = module.get(SessionCronService);
  });

  beforeEach(async () => {
    await mock();
  });

  afterEach(async () => {
    await destroyMocks();
  });

  it('if messager fails to detect expired reservation after timeout and retrys, application should be able to run a cleanup', async () => {
    await dataSource.transaction(async (tx) => {
      const reservation = tx.create(Reservation, {
        user: { id: MockCustomer.userOne.id },
        seat: { id: MockCustomer.seat.id },
        expiresAt: subSeconds(new Date(), 50),
      });

      await tx.save(reservation);

      await tx.update(
        Seat,
        { id: MockCustomer.seat.id },
        {
          status: SeatStatus.HOLDING,
          currentReservation: reservation,
        },
      );
    });

    const countCleanUps = await cronJobService.handle();

    expect(countCleanUps).toBe(1);
  });

  it('if cleanup is running, should not delete not expired reservations', async () => {
    await dataSource.transaction(async (tx) => {
      const reservation = tx.create(Reservation, {
        user: { id: MockCustomer.userOne.id },
        seat: { id: MockCustomer.seat.id },
        expiresAt: addSeconds(new Date(), 15),
      });

      await tx.save(reservation);

      await tx.update(
        Seat,
        { id: MockCustomer.seat.id },
        {
          status: SeatStatus.HOLDING,
          currentReservation: reservation,
        },
      );
    });

    const countCleanUps = await cronJobService.handle();

    expect(countCleanUps).toBe(0);
  });
});
