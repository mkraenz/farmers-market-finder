import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { patchNestJsSwagger } from 'nestjs-zod';
import { AppModule } from './app.module';
import { Environment } from './environment';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  patchNestJsSwagger();
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Farmers Market Finder API')
    .setDescription('Find local farmers market')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const cfg = app.get<ConfigService<Environment, true>>(ConfigService);
  const port = cfg.get<number>('FMF_PORT') || 3000;
  await app.listen(port);
  new Logger('boostrap').log(`Running on port ${port}`);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises -- bootstrap function cannot be awaited in top level
bootstrap();
