import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/core/persistence/database/redis/redis.service';
import { RabbitProvider } from 'src/core/persistence/messager/rabbit.provider';
import { groupCaches } from 'src/utils/functions/cache';
import { DataSource } from 'typeorm';
import { SessionModel } from '../../dto/session.model';

@Injectable()
export class MemorySessionService {
  private CACHE_SESSION: ReturnType<typeof groupCaches>['session'];
  private CACHE_SEAT: ReturnType<typeof groupCaches>['seat'];

  constructor(private readonly redisService: RedisService) {
    this.CACHE_SESSION = groupCaches(redisService).session;
    this.CACHE_SEAT = groupCaches(redisService).seat;
  }

  async getSession(sessionId: string): Promise<SessionModel.Session> {
    const sessionCached = await this.CACHE_SESSION.get({ sessionId });

    const keys = await this.redisService.redis.keys(
      `session-${sessionId}-seat*`,
    );

    const seats = [];
    for (const key of keys) {
      const seatData = await this.redisService.redis.get(key);
      seats.push(JSON.parse(seatData) as SessionModel.Seat);
    }

    if (sessionCached && sessionCached.countSeats === seats.length) {
      return {
        ...sessionCached,
        seats,
      };
    }
    return null;
  }

  async hydrateSeat(params: { sessionId: string; seat: SessionModel.Seat }) {
    const { seat, sessionId } = params;
    const cachedSession = await this.CACHE_SESSION.get({ sessionId });
    if (!cachedSession) return;
    this.CACHE_SEAT.set({ seatId: seat.id, sessionId }, seat);
  }

  async hydrateSession(session: SessionModel.Session) {
    const { duration, id, movie, price, room, showtime, seats } = session;
    await this.CACHE_SESSION.set(
      { sessionId: session.id },
      {
        duration,
        id,
        movie,
        price,
        room,
        showtime,
        countSeats: seats.length,
      },
    );
    await Promise.all(
      seats.map((seat) =>
        this.CACHE_SEAT.set(
          { seatId: seat.id, sessionId: session.id },
          {
            id: seat.id,
            placement: seat.placement,
            status: seat.status,
          },
        ),
      ),
    );
  }
}
