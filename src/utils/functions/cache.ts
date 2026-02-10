import { RedisService } from 'src/core/persistence/database/redis/redis.service';
import { SessionModel } from 'src/core/session/dto/session.model';
import { CustomerModel } from 'src/core/session/modules/customer/customer.model';

export const groupCaches = (redis: RedisService) => {
  return {
    session: redis.generateCache<
      Omit<SessionModel.Session, 'seats'> & {
        countSeats: number;
      },
      { sessionId: string }
    >('session-${sessionId}', 999999999999),

    seat: redis.generateCache<
      SessionModel.Seat,
      { sessionId: string; seatId: string }
    >('session-${sessionId}-seat-${seatId}', 999999999999),
  };
};
