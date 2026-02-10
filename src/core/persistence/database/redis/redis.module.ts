import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Global()
@Module({
  exports: [RedisService],
  providers: [
    {
      provide: RedisService,
      useValue: new RedisService(),
    },
  ],
})
export class RedisModule {}
