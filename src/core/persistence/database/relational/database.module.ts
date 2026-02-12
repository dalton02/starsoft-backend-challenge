import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from '../../../../database.source';
import { niceEnv } from 'src/utils/functions/env';
import { User } from 'src/core/auth/entities/user.entity';
import { Session } from 'src/core/session/entities/session.entity';
import { Seat } from 'src/core/session/entities/seat.entity';
import { Reservation } from 'src/core/session/entities/reservation.entity';
import { join } from 'path';
import { Sale } from 'src/core/session/entities/sale.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        autoLoadEntities: true,
        entities: [User, Session, Seat, Reservation, Sale],
        url: niceEnv.DATABASE_URL,
        synchronize: false,
        migrationsRun: true,
        migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
        logging: ['error'],
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
