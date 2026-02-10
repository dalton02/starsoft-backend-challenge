import { Global, Module } from '@nestjs/common';
import { DatabaseModule } from './persistence/database/relational/database.module';
import { RedisModule } from './persistence/database/redis/redis.module';

@Global()
@Module({
  imports: [DatabaseModule, RedisModule],
  controllers: [],
})
export class CoreModule {}
