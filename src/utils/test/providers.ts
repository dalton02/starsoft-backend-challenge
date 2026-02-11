import { DataSource } from 'typeorm';
import { niceEnv } from '../functions/env';
import { User } from 'src/core/auth/entities/user.entity';
import { Session } from 'src/core/session/entities/session.entity';
import { Seat } from 'src/core/session/entities/seat.entity';
import { Reservation } from 'src/core/session/entities/reservation.entity';
import { RedisService } from 'src/core/persistence/database/redis/redis.service';
import { Provider } from '@nestjs/common';
import { RabbitProvider } from 'src/core/persistence/messager/rabbit.provider';
import { jestTypeORM } from './typeorm.mock';

export const testProviders = {
  integrationDBTest: {
    provide: DataSource,
    useValue: new DataSource({
      type: 'postgres',
      entities: [User, Session, Seat, Reservation],
      url: niceEnv.TEST_DATABASE_URL,
      synchronize: false,
      logging: ['error'],
    }),
  },
  mockDB: {
    provide: DataSource,
    useValue: jestTypeORM,
  },
  mockRabbit: {
    provide: RabbitProvider,
    useValue: {
      emit: jest.fn(),
    },
  },
  redis: {
    provide: RedisService,
    useValue: RedisService,
  },
} satisfies Record<string, Provider>;
