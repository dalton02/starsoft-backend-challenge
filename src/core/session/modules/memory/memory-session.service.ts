import { Injectable } from '@nestjs/common';
import {
  RedisCache,
  RedisService,
} from 'src/core/persistence/database/redis/redis.service';
import { SessionModel } from '../../dto/session.model';
import { MemorySessionModel } from './memory-session.dto';
import { getMilliseconds, minutesToSeconds } from 'date-fns';
import { DataSource } from 'typeorm';
import { Session } from '../../entities/session.entity';
import Redlock from 'redlock';
import { formatSession } from 'src/utils/functions/format-session';
import { AppErrorNotFound } from 'src/utils/errors/app-errors';

@Injectable()
export class MemorySessionService {
  CACHE_SESSION: RedisCache<
    MemorySessionModel.SessionType,
    MemorySessionModel.SessionKey
  >;
  private redisLocker: Redlock;

  constructor(
    readonly redisService: RedisService,
    private readonly dataSource: DataSource,
  ) {
    this.CACHE_SESSION = redisService.generateCache<
      MemorySessionModel.SessionType,
      MemorySessionModel.SessionKey
    >('session-${sessionId}', minutesToSeconds(10));

    this.redisLocker = new Redlock([this.redisService.redis], {
      driftFactor: 0.01,
      retryCount: 10,
      retryDelay: 200,
      retryJitter: 200,
      automaticExtensionThreshold: 500,
    });
  }

  generateLockKey(sessionId: string) {
    return `lock-session:${sessionId}`;
  }

  async getOrReloadSession(sessionId: string): Promise<SessionModel.Session> {
    const cached = await this.CACHE_SESSION.get({ sessionId });

    if (cached) {
      return cached;
    }

    const session = await this.reloadSessionFromDB(sessionId);

    if (!session) {
      throw new AppErrorNotFound('Sessão não encontrada');
    }

    return session;
  }

  async reloadSessionFromDB(
    sessionId: string,
  ): Promise<SessionModel.Session | null> {
    const lockKey = this.generateLockKey(sessionId);
    let lock = await this.redisLocker.acquire([lockKey], 5000);

    try {
      const session = await this.dataSource.getRepository(Session).findOne({
        where: {
          id: sessionId,
        },
        relations: { seats: { currentReservation: true } },
      });

      if (!session) {
        throw new Error('Session is invalid');
      }

      const formattedSession = formatSession(session);

      await this.CACHE_SESSION.set({ sessionId: session.id }, formattedSession);

      return formattedSession;
    } catch (err) {
      await this.invalidateKey(sessionId);
    } finally {
      await lock.release();
    }
    return null;
  }

  async updateSeat(params: {
    sessionId: string;
    seatId: string;
    seat: Partial<SessionModel.Seat>;
  }): Promise<{ startTime: Date; endTime: Date }> {
    const { seat, seatId, sessionId } = params;

    const lockKey = this.generateLockKey(sessionId);
    let lock = await this.redisLocker.acquire([lockKey], 5000);

    let startTime = new Date();
    let endTime = new Date();

    try {
      let cachedSession = await this.CACHE_SESSION.get({ sessionId });

      if (!cachedSession)
        cachedSession = await this.reloadSessionFromDB(sessionId);

      const seatIndex = cachedSession.seats.findIndex((s) => s.id === seatId);

      if (seatIndex === -1) {
        return;
      }

      cachedSession.seats[seatIndex] = {
        ...cachedSession.seats[seatIndex],
        ...seat,
      };

      await this.CACHE_SESSION.set({ sessionId }, cachedSession);
    } catch (err) {
      console.error(err);
    } finally {
      await lock.release();
      endTime = new Date();
    }
    return { startTime, endTime };
  }

  async invalidateKey(sessionId: string) {
    await this.CACHE_SESSION.deleteKey({ sessionId });
  }
}
