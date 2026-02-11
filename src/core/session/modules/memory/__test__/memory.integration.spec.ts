import { Test, TestingModule } from '@nestjs/testing';
import { MemorySessionService } from '../memory-session.service';
import { DataSource } from 'typeorm';
import dataSourceProviderTest from 'src/core/persistence/database/relational/database.providers';
import { RedisService } from 'src/core/persistence/database/redis/redis.service';
import { mockSession } from '../__mock__/memory.mock';
import { SeatStatus } from 'src/core/session/enums/seat.enum';

describe('Memory Concurrency Test', () => {
  let service: MemorySessionService;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MemorySessionService,
        RedisService,
        {
          provide: DataSource,
          useValue: dataSourceProviderTest,
        },
      ],
    }).compile();
    service = module.get(MemorySessionService);
  });

  beforeEach(async () => {
    await service.CACHE_SESSION.set(
      {
        sessionId: mockSession.id,
      },
      mockSession,
    );
  });

  afterAll(async () => {
    await service.CACHE_SESSION.deleteKey({ sessionId: mockSession.id });
  });

  it('should execute hydrateSeat sequentially due to redis lock', async () => {
    const [timerA, timerB] = await Promise.all([
      service.hydrateSeat({
        sessionId: mockSession.id,
        seat: {
          ...mockSession.seats[0],
          placement: 'A',
          status: SeatStatus.HOLDING,
        },
      }),
      service.hydrateSeat({
        sessionId: mockSession.id,
        seat: {
          ...mockSession.seats[1],
          placement: 'B',
          status: SeatStatus.HOLDING,
        },
      }),
    ]);

    const overlap =
      timerA.startTime < timerB.endTime && timerB.startTime < timerA.endTime;

    expect(overlap).toBe(false);
  });
});
