import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { Environment } from './environment';

config();

const configService = new ConfigService<Environment, true>();

export default new DataSource({
  type: 'postgres',
  host: configService.get('POSTGRES_HOST'),
  port: configService.get('POSTGRES_PORT'),
  username: JSON.parse(configService.get('POSTGRES_CREDENTIALS_JSON')).username,
  password: JSON.parse(configService.get('POSTGRES_CREDENTIALS_JSON')).password,
  database: configService.get('POSTGRES_DB'),
  synchronize: false,
  entities: ['dist/src/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
});
