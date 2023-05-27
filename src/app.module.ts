import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ZodValidationPipe } from 'nestjs-zod';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { AppService } from './app.service';
import { Environment } from './environment';
import { MarketsModule } from './markets/markets.module';
import { S3Module } from './s3/s3.module';

const typeormConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: (configService: ConfigService<Environment, true>) => ({
    type: 'postgres',
    host: configService.get('POSTGRES_HOST'),
    port: configService.get('POSTGRES_PORT'),
    username: configService.get('POSTGRES_USER'),
    password: configService.get('POSTGRES_PASSWORD'),
    database: configService.get('POSTGRES_DB'),
    entities: [join(__dirname, '**', '*.entity.{ts,js}')],
    migrations: ['./migrations/*.js'],
    synchronize: true,
  }),

  inject: [ConfigService],
  dataSourceFactory: async (options) => {
    if (!options)
      throw new Error(
        'dataSourceFactory: options param undefined. Make sure useFactory returns the configuration object',
      );
    return new DataSource(options).initialize();
  },
};

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(typeormConfig),
    S3Module,
    MarketsModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    AppService,
  ],
})
export class AppModule {}
