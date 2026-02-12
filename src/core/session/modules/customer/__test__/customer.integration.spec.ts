import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { RedisService } from 'src/core/persistence/database/redis/redis.service';
import { SeatStatus } from 'src/core/session/enums/seat.enum';
import { CustomerSessionService } from '../customer.service';
import { RabbitProvider } from 'src/core/persistence/messager/rabbit.provider';
import { User } from 'src/core/auth/entities/user.entity';
import { MockCustomer } from '../__mocks__/customer.mocks';
import { Session } from 'src/core/session/entities/session.entity';
import { MemorySessionService } from '../../memory/memory-session.service';
import { Seat } from 'src/core/session/entities/seat.entity';
import { CustomerMessageHandler } from '../messager/customer.handlers';
import { CustomerServiceUnitMocks } from '../__mocks__/functions.mocks';
import { CustomerMessagerQueues } from '../messager/customer.provider';
import { wait } from 'src/utils/functions/time';
import dataSource from 'src/database.source';
import { addSeconds, subSeconds } from 'date-fns';
import { Reservation } from 'src/core/session/entities/reservation.entity';
import { CustomerCronJobs } from '../cron/customer.cron';

//Testes não envolvem a mensageria em si devido a serem operações assicronas demoradas
describe('Customer Integration Test', () => {
  let service: CustomerSessionService;
  let cronJobService: CustomerCronJobs;
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

      const data = await tx.save([userOne, userTwo, session, ...seats]);
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
        CustomerSessionService,
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
        CustomerMessageHandler,
        CustomerMessagerQueues,
        CustomerCronJobs,
      ],
    }).compile();
    service = module.get(CustomerSessionService);
    datasource = module.get(DataSource);
    cronJobService = module.get(CustomerCronJobs);
    await module.get(CustomerMessagerQueues).onModuleInit();
  });

  beforeEach(async () => {
    await mock();
  });

  afterEach(async () => {
    await destroyMocks();
  });

  it('should not let multiple users book the same seat', async () => {
    const seatId = MockCustomer.seat.id;
    const trys = 10;

    const results = await Promise.allSettled(
      Array.from({ length: trys }).map(() =>
        service.bookSeat({ seatId, userId: MockCustomer.userOne.id }),
      ),
    );

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(trys - 1);
  });

  it('should make a reservation', async () => {
    const seatId = MockCustomer.seat.id;

    const { bookId, expiresAt } = await service.bookSeat({
      seatId,
      userId: MockCustomer.userOne.id,
    });

    const seat = await dataSource.getRepository(Seat).findOne({
      where: {
        id: seatId,
      },
      relations: { currentReservation: true },
    });

    expect(seat.status).toBe(SeatStatus.HOLDING);
    expect(seat.currentReservation.id).toBe(bookId);
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
