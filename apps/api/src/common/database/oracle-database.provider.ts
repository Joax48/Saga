import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import oracledb, { Pool, BindParameters, Result } from 'oracledb';

import { DatabaseClient, QueryParameters } from './database-client.contract';

@Injectable()
export class OracleDatabaseProvider
  implements DatabaseClient, OnModuleInit, OnModuleDestroy
{
  private pool!: Pool;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

    this.pool = await oracledb.createPool({
      user: this.configService.get<string>('DB_USER'),
      password: this.configService.get<string>('DB_PASSWORD'),
      connectString: this.configService.get<string>('DB_CONNECT_STRING'),
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1,
    });
  }

  async onModuleDestroy() {
    await this.pool.close(10);
  }

  async query<T>(statement: string, params: QueryParameters = {}): Promise<T[]> {
    const connection = await this.pool.getConnection();

    try {
      const result = await connection.execute(statement, params as BindParameters);
      return this.extractRows(result);
    } finally {
      await connection.close();
    }
  }

  private extractRows<T>(result: Result<unknown>): T[] {
    if (!result.rows) {
      return [];
    }

    return result.rows as T[];
  }
}
