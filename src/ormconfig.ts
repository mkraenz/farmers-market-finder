import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

const configService = new ConfigService();

console.log(configService.get('POSTGRES_PASSWORD'));

export default new DataSource({
  type: 'postgres',
  host: '172.17.0.1',
  port: 5432,
  username: 'postgres',
  password: 'password',
  database: 'test',
  // host: configService.get('POSTGRES_HOST'),
  // port: configService.get('POSTGRES_PORT'),
  // username: configService.get('POSTGRES_USER'),
  // password: configService.get('POSTGRES_PASSWORD'),
  // database: configService.get('POSTGRES_DB'),
  synchronize: true,
  entities: ['**/*.entity.ts'],
  migrations: ['migrations/*.ts'],
});
