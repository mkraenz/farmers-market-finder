import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ZodValidationPipe } from 'nestjs-zod';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { AppController } from './app.controller';
import { Environment } from './environment';
import { MarketsModule } from './markets/markets.module';

const typeormConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: (configService: ConfigService<Environment, true>) => {
    return {
      type: 'postgres',
      host: configService.get('POSTGRES_HOST'),
      port: configService.get('POSTGRES_PORT'),
      username: JSON.parse(configService.get('POSTGRES_CREDENTIALS_JSON'))
        .username,
      password: JSON.parse(configService.get('POSTGRES_CREDENTIALS_JSON'))
        .password,
      database: configService.get('POSTGRES_DB'),
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      migrations: ['./migrations/*.js'],
      synchronize: false,
    };
  },

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
    MarketsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
