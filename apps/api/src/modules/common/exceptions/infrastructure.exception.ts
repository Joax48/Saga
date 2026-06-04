import { BaseException, ExceptionContext } from '../../../common/exceptions';

export class InfrastructureException extends BaseException {
  constructor(
    message: string,
    statusCode = 500,
    code = 'INFRASTRUCTURE_ERROR',
    context?: ExceptionContext,
  ) {
    super(message, statusCode, code, context);
  }
}
