import { ExceptionContext } from './exception-context';

export type { ExceptionContext };

export class BaseException extends Error {
  public readonly details?: unknown;

  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
    context?: ExceptionContext,
  ) {
    super(message, { cause: context?.cause });
    this.details = context?.details;
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
