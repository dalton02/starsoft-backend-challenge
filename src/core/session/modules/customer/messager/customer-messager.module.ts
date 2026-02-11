import { Module } from '@nestjs/common';
import { CustomerMessageHandler } from './customer.handlers';
import { CustomerMessagerQueues } from './customer.provider';
import { MemorySessionModule } from '../../memory/memory-session.module';

@Module({
  imports: [MemorySessionModule],
  providers: [CustomerMessageHandler, CustomerMessagerQueues],
})
export class CustomerMessagerModule {}
