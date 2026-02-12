import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import {
  ThrottlerStorageRedis,
  ThrottlerStorageRedisService,
} from '@nest-lab/throttler-storage-redis';
import { ThrottlerModule } from '@nestjs/throttler';
import { niceEnv } from './utils/functions/env';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerUserAndIpGuard } from './core/auth/guard/throttler.guard';
import { ScheduleModule } from '@nestjs/schedule';

import { minutesToMilliseconds, secondsToMilliseconds } from 'date-fns';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: secondsToMilliseconds(15),
          limit: 30,
        },
        {
          name: 'medium',
          ttl: minutesToMilliseconds(1),
          limit: 100,
        },
        {
          name: 'long',
          ttl: minutesToMilliseconds(15),
          limit: 400,
        },
      ],
      storage: new ThrottlerStorageRedisService(niceEnv.REDIS_URL),
    }),
    CoreModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerUserAndIpGuard,
    },
  ],
})
export class AppModule {}
