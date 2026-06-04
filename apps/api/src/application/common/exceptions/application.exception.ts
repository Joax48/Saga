import { BaseException, ExceptionContext } from '../../../common/exceptions';

export class ApplicationException extends BaseException {
  constructor(
    message: string,
    statusCode = 400,
    code = 'APPLICATION_ERROR',
    context?: ExceptionContext,
  ) {
    super(message, statusCode, code, context);
  }
}
