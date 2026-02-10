import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './database.source';
import { niceEnv } from 'src/utils/functions/env';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        autoLoadEntities: true,
        url: niceEnv.DATABASE_URL,
        synchronize: false,
        logging: ['query', 'error'],
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
