import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { niceEnv } from './utils/functions/env';

@Module({
  imports: [CoreModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
