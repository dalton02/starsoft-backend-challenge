import { Controller, Module } from '@nestjs/common';
import { ManagerSessionModule } from './modules/manager/manager.module';
import { CustomerModule } from './modules/customer/customer.module';
import { SessionCronModule } from './modules/cron/session-cron.module';
import { SessionMessagerModule } from './modules/messager/session-messager.module';

@Module({
  imports: [
    ManagerSessionModule,
    CustomerModule,
    SessionCronModule,
    SessionMessagerModule,
  ],
})
export class SessionModule {}
