import { Test } from '@nestjs/testing';
import { CustomerSessionService } from '../customer.service';
import { RedisService } from 'src/core/persistence/database/redis/redis.service';
import { DataSource } from 'typeorm';
import { niceEnv } from 'src/utils/functions/env';
import { testProviders } from 'src/utils/test/providers';
import { MockCustomer } from '../__mocks__/customer.mocks';

describe('Customer Service', () => {
  let service: CustomerSessionService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CustomerSessionService,
        {
          provide: DataSource,
          useValue: {
            ...testProviders.mockDB.useValue,
          },
        },
        testProviders.redis,
        testProviders.mockRabbit,
      ],
    }).compile();
    service = module.get(CustomerSessionService);
  });

  it('should', async () => {
    const data = await service.bookSeat({
      seatId: MockCustomer.seat.id,
      userId: MockCustomer.user.id,
    });
    expect(service).toBeDefined();
  });
});
