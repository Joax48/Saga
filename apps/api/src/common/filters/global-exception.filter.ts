import { ArgumentsHost, Catch, ExceptionFilter, Inject } from '@nestjs/common';
import { Request, Response } from 'express';
import { LOGGER_SERVICE, LoggerService } from '../logger/logger.service.contract';
import { ErrorPayload } from './error-payload';
import { mappers } from './exception-mappers';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(@Inject(LOGGER_SERVICE) private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const httpContext = host.switchToHttp();
    const response = httpContext.getResponse<Response>();
    const request = httpContext.getRequest<Request>();

    const payload = this.toErrorPayload(exception);
    const path = request.url;

    this.logger[payload.log.level](payload.log.message, {
      ...payload.log.context,
      path,
    });

    response.status(payload.response.statusCode).json({
      ...payload.response,
      path,
    });
  }

  private toErrorPayload(exception: unknown): ErrorPayload {
    return mappers.find((mapper) => mapper.canHandle(exception))!.map(exception);
  }
}
