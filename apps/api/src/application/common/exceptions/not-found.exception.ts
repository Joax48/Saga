import { ExceptionContext } from '../../../common/exceptions';
import { ApplicationException } from './application.exception';

export class NotFoundException extends ApplicationException {
  constructor(message: string, context?: ExceptionContext) {
    super(message, 404, 'NOT_FOUND', context);
  }
}
