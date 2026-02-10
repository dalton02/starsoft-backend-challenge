import { User } from 'src/core/auth/auth.entity';
import { niceEnv } from 'src/utils/functions/env';
import { DataSource, DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: niceEnv.DATABASE_URL,
  entities: [User],
  synchronize: false,
  migrations: ['migrations/*{.ts,.js,.mts}'],
  migrationsRun: false,
  logging: ['query', 'error'],
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
