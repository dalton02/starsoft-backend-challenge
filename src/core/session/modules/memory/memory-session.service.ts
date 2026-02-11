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
import { SeatStatus } from '../../enums/seat.enum';
@Injectable()
export class MemorySessionService {
  MAX_PAYMENT_TIMEOUT_SECONDS = 30;
  CACHE_SESSION: RedisCache<
    MemorySessionModel.SessionType,
    MemorySessionModel.SessionKey
  >;
  private redLock: Redlock;

  constructor(
    readonly redisService: RedisService,
    private readonly dataSource: DataSource,
  ) {
    this.CACHE_SESSION = redisService.generateCache<
      MemorySessionModel.SessionType,
      MemorySessionModel.SessionKey
    >('session-${sessionId}', minutesToSeconds(10));
    this.redLock = new Redlock([this.redisService.redis], {
      driftFactor: 0.01,
      retryCount: 10,
      retryDelay: 200,
      retryJitter: 200,
      automaticExtensionThreshold: 500,
    });
  }

  async onModuleInit() {}

  async hydrateFromDB(sessionId: string) {
    console.log('HYDRATION FROM DB');
    const session = await this.dataSource.getRepository(Session).findOne({
      where: {
        id: sessionId,
      },
      relations: { seats: true },
    });

    if (!session) {
      return;
    }

    await this.hydrateSession(session);
  }

  async getSession(sessionId: string): Promise<SessionModel.Session> {
    const session = await this.CACHE_SESSION.get({ sessionId });

    if (!session) await this.hydrateFromDB(sessionId);

    return await this.CACHE_SESSION.get({ sessionId });
  }

  async hydrateSeat(params: {
    sessionId: string;
    seat: SessionModel.Seat;
  }): Promise<{ startTime: Date; endTime: Date }> {
    const { seat, sessionId } = params;

    const lockKey = `lock:${sessionId}`;
    let lock = await this.redLock.acquire([lockKey], 5000);
    let startTime = new Date();
    let endTime = new Date();
    try {
      const cachedSession = await this.getSession(sessionId);

      const seatIndex = cachedSession.seats.findIndex((s) => s.id === seat.id);
      if (seatIndex === -1) {
        return;
      }

      cachedSession.seats[seatIndex] = seat;
      await this.CACHE_SESSION.set({ sessionId }, cachedSession);
    } catch (err) {
      console.error(err);
    } finally {
      await lock.release();
      endTime = new Date();
    }
    return { startTime, endTime };
  }

  async hydrateSession(session: SessionModel.Session) {
    await this.CACHE_SESSION.set({ sessionId: session.id }, session);
  }
}
