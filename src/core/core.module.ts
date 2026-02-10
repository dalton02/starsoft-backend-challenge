import { Global, Module } from '@nestjs/common';
import { DatabaseModule } from './persistence/database/relational/database.module';
import { RedisModule } from './persistence/database/redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { TicketModule } from './ticket/ticket.module';

@Global()
@Module({
  imports: [DatabaseModule, RedisModule, AuthModule, TicketModule],
  controllers: [],
})
export class CoreModule {}
