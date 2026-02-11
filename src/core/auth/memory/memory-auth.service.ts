import { Injectable } from '@nestjs/common';
import {
  RedisCache,
  RedisService,
} from 'src/core/persistence/database/redis/redis.service';
import { AuthModel } from '../auth.model';
import { minutesToSeconds, secondsToMinutes } from 'date-fns';

@Injectable()
export class MemoryAuthService {
  CACHE_USER: RedisCache<AuthModel.User, { userId: string }>;
  CACHE_RATE_LIMITING: RedisCache<{ trys: number }, { ip: string }>;
  constructor(private readonly redisService: RedisService) {
    this.CACHE_USER = redisService.generateCache<
      AuthModel.User,
      { userId: string }
    >('user-${userId}', minutesToSeconds(60));
    this.CACHE_RATE_LIMITING = redisService.generateCache<
      { trys: number },
      { ip: string }
    >('ip-${ip}', minutesToSeconds(60));
  }

  async hydrate(user: AuthModel.User) {
    await this.CACHE_USER.set({ userId: user.id }, user);
  }

  async get(userId: string) {
    return await this.CACHE_USER.get({ userId });
  }
}
