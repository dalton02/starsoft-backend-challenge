import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './database.source';
import { niceEnv } from 'src/utils/functions/env';
import { User } from 'src/core/auth/entities/user.entity';
import { Session } from 'src/core/session/entities/session.entity';
import { Seat } from 'src/core/session/entities/seat.entity';
import { Reservation } from 'src/core/session/entities/reservation.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        autoLoadEntities: true,
        entities: [User, Session, Seat, Reservation],
        url: niceEnv.DATABASE_URL,
        synchronize: false,
        logging: ['query', 'error'],
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
