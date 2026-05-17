import { Injectable } from '@nestjs/common';
import { mkdirSync } from 'fs';
import { join } from 'path';
import pino from 'pino';

import type { LoggerService } from './logger.service.contract';

@Injectable()
export class PinoLoggerProvider implements LoggerService {
  private readonly logger: ReturnType<typeof pino>;

  constructor() {
    const logDir = join(process.cwd(), 'logs');
    mkdirSync(logDir, { recursive: true });

    const transport = pino.transport({
      target: 'pino-roll',
      options: {
        file: join(logDir, 'app.log'),
        frequency: 'daily',
        size: '10m',
        dateFormat: 'yyyy-MM-dd',
      },
    });

    this.logger = pino(
      {
        level: 'debug',
        base: undefined,
        timestamp: pino.stdTimeFunctions.isoTime,
        formatters: {
          level: (label) => ({ level: label }),
        },
      },
      transport,
    );
  }

  info(message: string, context?: Record<string, unknown>): void {
    context ? this.logger.info(context, message) : this.logger.info(message);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    context ? this.logger.warn(context, message) : this.logger.warn(message);
  }

  error(message: string, context?: Record<string, unknown>): void {
    context ? this.logger.error(context, message) : this.logger.error(message);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    context ? this.logger.debug(context, message) : this.logger.debug(message);
  }
}
