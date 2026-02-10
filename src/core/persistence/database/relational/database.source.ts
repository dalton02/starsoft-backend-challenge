import { User } from 'src/core/auth/entities/user.entity';
import { Reservation } from 'src/core/ticket/entities/reservation.entity';
import { Seat } from 'src/core/ticket/entities/seat.entity';
import { Session } from 'src/core/ticket/entities/session.entity';
import { niceEnv } from 'src/utils/functions/env';
import { DataSource, DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: niceEnv.DATABASE_URL,
  entities: [User, Seat, Session, Reservation],
  synchronize: false,
  migrations: ['migrations/*{.ts,.js,.mts}'],
  migrationsRun: false,
  logging: ['query', 'error'],
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
