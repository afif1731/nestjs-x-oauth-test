/* eslint-disable @darraghor/nestjs-typed/should-specify-forbid-unknown-values */
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';

import express from 'express';
import session from 'express-session';

import { AppModule } from './app.module';

async function bootstrap() {
  const expressApp = express();
  expressApp.disable('x-powered-by');

  const adapter = new ExpressAdapter(expressApp);

  const app = await NestFactory.create(AppModule, adapter);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: '*',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      skipMissingProperties: true,
    }),
  );

  app.use(
    session({
      secret: 'my-secret',
      resave: false,
      saveUninitialized: false,
    }),
  );

  await app.listen(process.env.PORT ?? 4000, '0.0.0.0');
}

bootstrap();
