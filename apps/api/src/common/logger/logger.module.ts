import { Global, Module } from '@nestjs/common';

import { LOGGER_SERVICE } from './logger.service.contract';
import { PinoLoggerProvider } from './pino-logger.provider';

@Global()
@Module({
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
