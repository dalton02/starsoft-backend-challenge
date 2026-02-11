import { Module } from '@nestjs/common';
import { CustomerSessionController } from './customer.controller';
import { CustomerSessionService } from './customer.service';
import { CustomerMessageHandler } from './messager/customer.handlers';
import { MemorySessionModule } from '../memory/memory-session.module';
import { CustomerMessagerModule } from './messager/customer-messager.module';

@Module({
  imports: [MemorySessionModule, CustomerMessagerModule],
  providers: [CustomerSessionService, CustomerMessageHandler],
  controllers: [CustomerSessionController],
})
export class CustomerModule {}
