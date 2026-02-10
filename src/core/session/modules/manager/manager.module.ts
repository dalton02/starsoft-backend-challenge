import { Module } from '@nestjs/common';
import { ManagerSessionService } from './manager.service';
import { ManagerSessionController } from './manager.controller';
import { MemorySessionModule } from '../memory/memory-session.module';

@Module({
  imports: [MemorySessionModule],
  providers: [ManagerSessionService],
  controllers: [ManagerSessionController],
})
export class ManagerSessionModule {}
