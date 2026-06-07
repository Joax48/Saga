import { INestApplication, ValidationPipe, ModuleMetadata } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Test } from '@nestjs/testing';

import { GlobalExceptionFilter } from '../../../common/filters/global-exception.filter';
import {
  LOGGER_SERVICE,
  LoggerService,
} from '../../../common/logger/logger.service.contract';

export function createTestLogger(): jest.Mocked<LoggerService> {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };
}

export async function createTestApp(
  moduleDefinition: ModuleMetadata,
  // allows injection of a custom logger for tests that need to verify logging behavior.
  logger = createTestLogger(),
): Promise<{ app: INestApplication; logger: jest.Mocked<LoggerService> }> {
  const moduleRef = await Test.createTestingModule({
    ...moduleDefinition,
    providers: [
      ...(moduleDefinition.providers ?? []),
      {
        provide: LOGGER_SERVICE,
        useValue: logger,
      },
      {
        provide: APP_FILTER,
        useClass: GlobalExceptionFilter,
      },
    ],
  }).compile();

  const app = moduleRef.createNestApplication();

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();

  // returns logger so callers can assert on specific log calls made during a request
  return { app, logger };
}
