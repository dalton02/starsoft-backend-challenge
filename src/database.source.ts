import { join } from 'path';
import { User } from 'src/core/auth/entities/user.entity';
import { Reservation } from 'src/core/session/entities/reservation.entity';
import { Seat } from 'src/core/session/entities/seat.entity';
import { Session } from 'src/core/session/entities/session.entity';
import { niceEnv } from 'src/utils/functions/env';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Sale } from './core/session/entities/sale.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: niceEnv.DATABASE_URL,
  entities: [User, Seat, Session, Reservation, Sale],
  synchronize: false,
  migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
  migrationsRun: true,
  logging: ['error'],
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
