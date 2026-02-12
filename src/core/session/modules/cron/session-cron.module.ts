import { Module } from '@nestjs/common';
import { SessionCronService } from './session-cron.service';

@Module({
  providers: [SessionCronService],
})
export class SessionCronModule {}
