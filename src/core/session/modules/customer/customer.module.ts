import { Module } from '@nestjs/common';
import { CustomerSessionController } from './customer.controller';
import { CustomerSessionService } from './customer.service';

@Module({
  providers: [CustomerSessionService],
  controllers: [CustomerSessionController],
})
export class CustomerModule {}
