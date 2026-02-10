import { Module } from '@nestjs/common';
import { MemorySessionService } from './memory-session.service';

@Module({ providers: [MemorySessionService], exports: [MemorySessionService] })
export class MemorySessionModule {}
