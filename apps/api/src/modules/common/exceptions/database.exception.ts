import { ExceptionContext } from '../../../common/exceptions';
import { InfrastructureException } from './infrastructure.exception';

export class DatabaseException extends InfrastructureException {
  constructor(message: string, context?: ExceptionContext) {
    super(message, 500, 'DATABASE_ERROR', context);
  }
}
