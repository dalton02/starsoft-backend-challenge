import { Module } from '@nestjs/common';
import { ManagerSessionService } from './manager.service';
import { ManagerSessionController } from './manager.controller';

@Module({
  providers: [ManagerSessionService],
  controllers: [ManagerSessionController],
})
export class ManagerSessionModule {}
