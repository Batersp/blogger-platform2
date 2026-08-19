import { DataSourceOptions } from 'typeorm';

export const options: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '261432304',
  database: 'blogger-platform',
  synchronize: false,
  logging: true,
};
