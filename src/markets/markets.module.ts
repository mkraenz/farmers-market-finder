import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Module } from '../s3/s3.module';
import { Market } from './entities/market.entity';
import { MarketsController } from './markets.controller';
import { MarketRepository } from './markets.repository';
import { MarketsService } from './markets.service';

@Module({
  imports: [TypeOrmModule.forFeature([Market]), S3Module],
  controllers: [MarketsController],
  providers: [MarketsService, MarketRepository],
})
export class MarketsModule {}
