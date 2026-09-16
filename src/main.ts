import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exception.filter';

function environment() {
  const databaseUrl = process.env.DATABASE_URL;
  const frontendUrl = process.env.FRONTEND_URL;
  const port = Number(process.env.PORT);
  if (!databaseUrl) throw new Error('DATABASE_URL is required.');
  if (!frontendUrl) throw new Error('FRONTEND_URL is required.');
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be a valid port number.');
  return { frontendUrl, port };
}

async function bootstrap() {
  const env = environment();
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: env.frontendUrl, methods: ['GET', 'POST', 'PATCH', 'DELETE'], credentials: false });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(env.port);
}

bootstrap();
