import { Module } from '@nestjs/common';
import { SessionMessageHandler } from './session-messager.handlers';
import { SessionMessagerQueues } from './session-messager.provider';
import { MemorySessionModule } from '../memory/memory-session.module';

@Module({
  imports: [MemorySessionModule],
  providers: [SessionMessageHandler, SessionMessagerQueues],
})
export class SessionMessagerModule {}
