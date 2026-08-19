import { DataSource, DataSourceOptions } from 'typeorm';
import { options } from './db/options';

const migrationOptions: DataSourceOptions = {
  ...options,
  migrations: [__dirname + '/../migrations/*.ts'],
  entities: ['src/**/*.entity.ts'],
};

export default new DataSource(migrationOptions);
