import { Global, Module } from '@nestjs/common';
import { DatabaseModule } from './persistence/database/relational/database.module';
import { RedisModule } from './persistence/database/redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { SessionModule } from './session/session.module';
import { RabbitModule } from './persistence/messager/rabbit.module';

@Global()
@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    RabbitModule,
    AuthModule,
    SessionModule,
  ],
  controllers: [],
})
export class CoreModule {}
