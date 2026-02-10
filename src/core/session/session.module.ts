import { Controller, Module } from '@nestjs/common';
import { ManagerSessionModule } from './modules/manager/manager.module';
import { CustomerModule } from './modules/customer/customer.module';

@Module({
  imports: [ManagerSessionModule, CustomerModule],
})
export class SessionModule {}
