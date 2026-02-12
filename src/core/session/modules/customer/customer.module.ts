import { Module } from '@nestjs/common';
import { CustomerSessionController } from './customer.controller';
import { CustomerSessionService } from './customer.service';
import { MemorySessionModule } from '../memory/memory-session.module';

@Module({
  imports: [MemorySessionModule],
  providers: [CustomerSessionService],
  controllers: [CustomerSessionController],
})
export class CustomerModule {}
