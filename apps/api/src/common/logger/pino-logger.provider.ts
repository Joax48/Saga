import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdirSync } from 'fs';
import { join } from 'path';
import pino from 'pino';

import type { LoggerService } from './logger.service.contract';

const STDOUT = 1;

const FILE_ROTATION_FREQUENCY = 'daily';
const FILE_MAX_SIZE = '10m';
const FILE_DATE_FORMAT = 'yyyy-MM-dd';

@Injectable()
export class PinoLoggerProvider implements LoggerService {
  private readonly logger: ReturnType<typeof pino>;

  constructor(private readonly configService: ConfigService) {
    const logDir = join(process.cwd(), 'logs');

    // Create log directory if it does not exist, creating parent directories if necessary
    // Use synchronous function to ensure the directory is created before it is registered in the pino-roll transport
    // and to avoid making the constructor asynchronous
    mkdirSync(logDir, { recursive: true });

    const streams: { level: pino.Level; stream: pino.DestinationStream }[] = [
      {
        // Transport for file logging with rotation
        level: 'debug',
        stream: pino.transport({
          target: 'pino-roll',
          options: {
            file: join(logDir, 'app.log'),
            frequency: FILE_ROTATION_FREQUENCY,
            size: FILE_MAX_SIZE,
            dateFormat: FILE_DATE_FORMAT,
          },
        }),
      },
    ];

    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');

    if (nodeEnv !== 'production') {
      streams.push({
        // Transport for logging to stdout/console
        level: 'debug',
        stream: pino.transport({
          target: 'pino-pretty',
          options: {
            colorize: true,
            destination: STDOUT,
          },
        }),
      });
    }

    this.logger = pino(
      {
        level: 'debug', // Logger will log all levels from debug and above
        base: undefined,
        timestamp: pino.stdTimeFunctions.isoTime,
        formatters: {
          level: (label) => ({ level: label }), // Output level as a string instead of a number
        },
      },
      pino.multistream(streams),
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
