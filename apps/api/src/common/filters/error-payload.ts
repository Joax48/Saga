export interface ErrorPayload {
  log: {
    level: 'warn' | 'error';
    message: string;
    context: Record<string, unknown>;
  };
  response: {
    statusCode: number;
    code: string;
    message: string;
    details?: unknown;
  };
}
