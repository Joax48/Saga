export const DATABASE_CLIENT = Symbol('DATABASE_CLIENT');

export type QueryParameters = Record<string, unknown>;

export interface DatabaseClient {
  query<T>(statement: string, params?: QueryParameters): Promise<T[]>;
}
