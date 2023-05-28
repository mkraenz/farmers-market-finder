import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { CreateMarketApiInput } from '../src/markets/dto/create-market.dto';
import { UpdateMarketApiInput } from '../src/markets/dto/update-market.dto';
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

describe('/markets/', () => {
  const markets = '/markets/';
  it('POST creates a new market and GET it', async () => {
    const reqBody: CreateMarketApiInput = {
      name: "Sesame Street's Market POST test",
      teaser: 'Fresh produce and artisanal apparel',
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
      images: [],
    });

    const { body: getBody } = await request(app.getHttpServer())
      .get(`${markets}${body.id}`)
      .expect(200);
    expect(getBody).toEqual({
      ...reqBody,
      id: expect.stringMatching(uuidv4),
      images: [],
    });
  });

  it('DELETE deletes a market and validates it cannot be GET anymore', async () => {
    const reqBody: CreateMarketApiInput = {
      name: "Sesame Street's Market DELETE test",
      teaser: 'Fresh produce and artisanal apparel',
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

    await request(app.getHttpServer())
      .delete(`${markets}${body.id}`)
      .expect(204);

    await request(app.getHttpServer()).get(`${markets}${body.id}`).expect(404);
  });

  it('PATCH updates a market', async () => {
    const reqBody: CreateMarketApiInput = {
      name: "Sesame Street's Market PATCH test",
      teaser: 'Fresh produce and artisanal apparel',
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

    const updateBody: UpdateMarketApiInput = {
      name: "Baker Street's Market PATCH test",
      teaser: 'Find the best jewelry and accessories on our weekly market',
      address: 'Baker Street 221B',
      city: 'London',
      location: {
        lat: 34.56,
        long: 45.67,
      },
      // explicitly not updating country to test that it is not updated but we still get it back
      products: ['Jewelry', 'Accessory'],
      state: 'AP',
      zip: '54321',
      // images: [
      //   {
      //     url: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      //     description: 'Fruit Market',
      //   },
      // ],
    };
    const { body } = await request(app.getHttpServer())
      .post(markets)
      .set('Content-Type', 'application/json')
      .send(reqBody)
      .expect(201);

    const { body: resBody } = await request(app.getHttpServer())
      .patch(`${markets}${body.id}`)
      .set('Content-Type', 'application/json')
      .send(updateBody)
      .expect(200);

    expect(resBody).toEqual({
      ...updateBody,
      id: expect.stringMatching(uuidv4),
      country: 'US',
      images: [],
    });
  });
});
