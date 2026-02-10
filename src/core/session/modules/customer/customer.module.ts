import { Module } from '@nestjs/common';
import { CustomerSessionController } from './customer.controller';
import { CustomerSessionService } from './customer.service';
import { CustomerConsumer } from './customer.consumer';
import { MemorySessionModule } from '../memory/memory-session.module';

@Module({
  imports: [MemorySessionModule],
  providers: [CustomerSessionService, CustomerConsumer],
  controllers: [CustomerSessionController],
})
export class CustomerModule {}
