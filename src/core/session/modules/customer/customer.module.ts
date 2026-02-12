import { Module } from '@nestjs/common';
import { CustomerSessionController } from './customer.controller';
import { CustomerSessionService } from './customer.service';
import { CustomerMessageHandler } from './messager/customer.handlers';
import { MemorySessionModule } from '../memory/memory-session.module';
import { CustomerMessagerModule } from './messager/customer-messager.module';
import { CustomerCronJobs } from './cron/customer.cron';

@Module({
  imports: [MemorySessionModule, CustomerMessagerModule],
  providers: [CustomerSessionService, CustomerMessageHandler, CustomerCronJobs],
  controllers: [CustomerSessionController],
})
export class CustomerModule {}
