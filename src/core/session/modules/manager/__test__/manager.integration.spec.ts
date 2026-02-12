import dataSource from 'src/database.source';
import { ManagerSessionService } from '../manager.service';
import { MemorySessionService } from '../../memory/memory-session.service';
import { DataSource } from 'typeorm';
import { Test } from '@nestjs/testing';
import { ManagerServiceMock } from '../__mock__/manager.mock';
import { RedisService } from 'src/core/persistence/database/redis/redis.service';

describe('Manager Integration Test', () => {
  let service: ManagerSessionService;
  let memory: MemorySessionService;
  beforeAll(async () => {
    await dataSource.initialize();
    const module = await Test.createTestingModule({
      providers: [
        ManagerSessionService,

        MemorySessionService,
        {
          provide: DataSource,
          useValue: dataSource,
        },
        RedisService,
      ],
    }).compile();
    service = module.get(ManagerSessionService);
    memory = module.get(MemorySessionService);
  });

  it('should create a session and update in redis', async () => {
    const session = await service.create(ManagerServiceMock.bodySession);

    const cachedSession = await memory.CACHE_SESSION.get({
      sessionId: session.id,
    });

    expect(cachedSession).toBeDefined();
  });
});
