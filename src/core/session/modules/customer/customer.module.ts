import { Module } from '@nestjs/common';
import { CustomerSessionController } from './customer.controller';
import { CustomerSessionService } from './customer.service';
import { CustomerConsumer } from './customer.consumer';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { niceEnv } from 'src/utils/functions/env';
import { RabbitQueue } from 'src/utils/types/rabbit';

@Module({
  providers: [CustomerSessionService],
  controllers: [CustomerSessionController, CustomerConsumer],
})
export class CustomerModule {}
