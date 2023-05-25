import { Injectable } from '@nestjs/common';
import { CreateMarketDto } from './dto/create-market.dto';
import { UpdateMarketDto } from './dto/update-market.dto';

@Injectable()
export class MarketsService {
  create(dto: CreateMarketDto) {
    return 'This action adds a new market';
  }

  findAll() {
    return `This action returns all markets`;
  }

  findOne(id: string) {
    return `This action returns a #${id} market`;
  }

  update(id: string, dto: UpdateMarketDto) {
    return `This action updates a #${id} market`;
  }

  remove(id: string) {
    return `This action removes a #${id} market`;
  }
}
