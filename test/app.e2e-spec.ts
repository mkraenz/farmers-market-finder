import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { CreateMarketDto } from '../src/markets/dto/create-market.dto';
import { AppModule } from './../src/app.module';

const uuidv4 =
  /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

let app: INestApplication;

beforeEach(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();
});

afterAll(async () => {
  await app.close();
});

it('/ (GET)', () => {
  return request(app.getHttpServer())
    .get('/')
    .expect(200)
    .expect('Hello World!');
});

describe('/markets/', () => {
  const markets = '/markets/';
  it('POST creates a new market', async () => {
    const reqBody: CreateMarketDto = {
      address: 'Sesame Street 12',
      city: 'Philadelphia',
      country: 'US',
      location: {
        lat: 12.34,
        long: 23.45,
      },
      products: ['Cheese', 'Dairy', 'Textile', 'Flax'],
      state: 'PA',
      zip: '12345',
    };
    const { body } = await request(app.getHttpServer())
      .post(markets)
      .set('Content-Type', 'application/json')
      .send(reqBody)
      .expect(201);
    expect(body).toEqual({
      ...reqBody,
      id: expect.stringMatching(uuidv4),
    });
  });
});
