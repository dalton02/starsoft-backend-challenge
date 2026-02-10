import { RedisService } from 'src/core/persistence/database/redis/redis.service';

export const groupCaches = (redis: RedisService) => {
  return {
    reservation: redis.generateCache<{
      reservationId: string;
      paymentKey: string;
    }>({
      prefix: 'reservation',
      expiration: 30,
    }),
  };
};
