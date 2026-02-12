import dataSource from 'src/database.source';
import { ManagerSessionService } from '../manager.service';
import { MemorySessionService } from '../../memory/memory-session.service';
import { DataSource } from 'typeorm';
import { Test } from '@nestjs/testing';
import { ManagerServiceMock } from '../__mock__/manager.mock';
import { RedisService } from 'src/core/persistence/database/redis/redis.service';
import { AppErrorBadRequest } from 'src/utils/errors/app-errors';

describe('Manager Service Test', () => {
  let service: ManagerSessionService;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ManagerSessionService,
        {
          provide: MemorySessionService,
          useValue: {
            CACHE_SESSION: {
              set: jest.fn(),
            },
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((cb) =>
              cb({
                save: jest.fn(),
              }),
            ),
          },
        },
      ],
    }).compile();
    service = module.get(ManagerSessionService);
  });

  it('should throw if have less than 16 seats', async () => {
    await expect(
      service.create(ManagerServiceMock.incorrectBodySession),
    ).rejects.toThrow();
  });

  it('should throw if have less than 16 seats AFTER removing duplicates', async () => {
    const mock = ManagerServiceMock.incorrectBodySession;

    mock.placements = Array.from({ length: 20 })
      .fill(undefined)
      .map(() => `ASSENTO`);

    await expect(service.create(mock)).rejects.toThrow();
  });
});
