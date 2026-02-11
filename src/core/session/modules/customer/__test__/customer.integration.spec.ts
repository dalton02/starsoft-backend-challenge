import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import dataSourceProviderTest from 'src/core/persistence/database/relational/database.providers';
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

describe('Customer Integration Test', () => {
  let service: CustomerSessionService;
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
    await dataSourceProviderTest.initialize();
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
          useValue: dataSourceProviderTest,
        },
        CustomerMessageHandler,
        CustomerMessagerQueues,
      ],
    }).compile();
    service = module.get(CustomerSessionService);
    datasource = module.get(DataSource);
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
    ); //Mensageria é enviada aqui mas eu não preciso testar ela

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

    const seat = await dataSourceProviderTest.getRepository(Seat).findOne({
      where: {
        id: seatId,
      },
      relations: { currentReservation: true },
    });

    expect(seat.status).toBe(SeatStatus.HOLDING);
    expect(seat.currentReservation.id).toBe(bookId);
  });
});
