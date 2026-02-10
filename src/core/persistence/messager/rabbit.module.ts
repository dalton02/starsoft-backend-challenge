import { Global, Module } from '@nestjs/common';
import { RabbitProvider } from './rabbit.provider';
@Global()
@Module({
  providers: [RabbitProvider],
  exports: [RabbitProvider],
})
export class RabbitModule {}
