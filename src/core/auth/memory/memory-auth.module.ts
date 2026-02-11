import { Module } from '@nestjs/common';
import { MemoryAuthService } from './memory-auth.service';

@Module({
  providers: [MemoryAuthService],
  exports: [MemoryAuthService],
})
export class MemoryAuthModule {}
