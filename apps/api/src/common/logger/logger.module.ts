import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { LOGGER_SERVICE } from './logger.service.contract';
import { PinoLoggerProvider } from './pino-logger.provider';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    PinoLoggerProvider,
    {
      provide: LOGGER_SERVICE,
      useExisting: PinoLoggerProvider,
    },
  ],
  exports: [LOGGER_SERVICE],
})
export class LoggerModule {}
