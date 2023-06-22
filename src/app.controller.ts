import { Controller, Get } from '@nestjs/common';
import { randomUUID } from 'crypto';

const id = randomUUID();

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return `Hello there from server ${id} v0.0.3`;
  }
}
