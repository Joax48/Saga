import { HttpException, HttpStatus } from '@nestjs/common';
import { BaseException } from '../exceptions';
import { ErrorPayload } from './error-payload';

export interface ExceptionMapper {
  canHandle(exception: unknown): boolean;
  map(exception: unknown): ErrorPayload;
}

function parseStack(stack: string | undefined): string[] | undefined {
  return stack?.split('\n').filter((line) => !line.includes('node_modules'));
}

function toLabel(name: string): string {
  // inserts a space before each capital letter and trims the leading space
  return name.replace(/([A-Z])/g, ' $1').trim();
}

function toCode(name: string): string {
  return name
    .replace(/Exception$/, '') // strips the "Exception" suffix
    .replace(/([A-Z])/g, '_$1') // inserts an underscore before each capital letter
    .replace(/^_/, '') // removes the leading underscore produced by the previous step
    .toUpperCase();
}

function toLevel(statusCode: number): 'warn' | 'error' {
  return statusCode >= 500 ? 'error' : 'warn';
}

function stackContext(
  level: 'warn' | 'error',
  stack: string | undefined,
): Record<string, unknown> {
  // only attaches the stack trace for 5xx errors
  return level === 'error' ? { stack: parseStack(stack) } : {};
}

function causeContext(
  level: 'warn' | 'error',
  exception: Error,
): Record<string, unknown> {
  // only attaches the cause stack when a chained error exists and the level is 5xx
  return level === 'error' && exception.cause instanceof Error
    ? { cause: parseStack(exception.cause.stack) }
    : {};
}

class BaseExceptionMapper implements ExceptionMapper {
  canHandle(exception: unknown): boolean {
    return exception instanceof BaseException;
  }

  map(exception: BaseException): ErrorPayload {
    const level = toLevel(exception.statusCode);

    return {
      log: {
        level,
        message: toLabel(exception.name),
        context: {
          statusCode: exception.statusCode,
          code: exception.code,
          message: exception.message,
          details: exception.details,
          ...stackContext(level, exception.stack),
          ...causeContext(level, exception),
        },
      },
      response: {
        statusCode: exception.statusCode,
        code: exception.code,
        message: exception.message,
        ...(level === 'warn' && { details: exception.details }), // omits details from the response for 5xx errors to avoid leaking internals
      },
    };
  }
}

class HttpExceptionMapper implements ExceptionMapper {
  canHandle(exception: unknown): boolean {
    return exception instanceof HttpException;
  }

  map(exception: HttpException): ErrorPayload {
    const body = exception.getResponse();
    const message =
      typeof body === 'string'
        ? body
        : ((body as { message?: string }).message ?? exception.message);
    const statusCode = exception.getStatus();
    const level = toLevel(statusCode);
    const code = toCode(exception.name);

    return {
      log: {
        level,
        message: toLabel(exception.name),
        context: {
          statusCode,
          code,
          message,
          ...stackContext(level, exception.stack),
          ...causeContext(level, exception),
        },
      },
      response: {
        statusCode,
        code,
        message,
      },
    };
  }
}

class FallbackExceptionMapper implements ExceptionMapper {
  canHandle(_: unknown): boolean {
    return true;
  }

  map(exception: unknown): ErrorPayload {
    // non-Error thrown values are assigned directly so the logger serializes their properties
    const context =
      exception instanceof Error
        ? {
            ...stackContext('error', exception.stack),
            ...causeContext('error', exception),
          }
        : { raw: exception };

    return {
      log: {
        level: 'error',
        message: 'Unhandled Exception',
        context,
      },
      response: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: 'UNEXPECTED_ERROR',
        message: 'An unexpected error occurred. Please try again later.',
      },
    };
  }
}

export const mappers: ExceptionMapper[] = [
  new BaseExceptionMapper(),
  new HttpExceptionMapper(),
  new FallbackExceptionMapper(),
];
