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
    // Return BLOB columns as Node.js Buffers instead of Lob stream objects
    oracledb.fetchAsBuffer = [oracledb.BLOB];
    oracledb.fetchAsString = [oracledb.CLOB];

    this.pool = await oracledb.createPool({
      user: this.configService.getOrThrow<string>('DB_USER'),
      password: this.configService.getOrThrow<string>('DB_PASSWORD'),
      connectString: this.configService.getOrThrow<string>('DB_CONNECT_STRING'),
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1,
    });
    /* 
    Provoca que los objetos retornados como CLOB (Character Large Object)
    vuelva como un string. Consultas que hacen uso de esto pueden ser
    encontradas en el archivo scientific-productions-queries.ts
    */
    oracledb.fetchAsString = [oracledb.CLOB];
  }

  async onModuleDestroy() {
    await this.pool.close(10);
  }

  async query<T>(statement: string, params: QueryParameters = {}): Promise<T[]> {
    const connection = await this.pool.getConnection();

    try {
      const schema = this.configService.getOrThrow<string>('DB_SCHEMA');
      await connection.execute(
        `ALTER SESSION SET CURRENT_SCHEMA = ${schema.toUpperCase()}`,
      );
      await connection.execute(`ALTER SESSION SET NLS_COMP=LINGUISTIC`);
      await connection.execute(`ALTER SESSION SET NLS_SORT=SPANISH_M_AI`);

      const result = await connection.execute(statement, params as BindParameters);

      // Commit when the statement is a DML operation so callers don't need to manage transactions manually
      const stmt = statement.trim().toUpperCase();
      if (
        stmt.startsWith('INSERT') ||
        stmt.startsWith('UPDATE') ||
        stmt.startsWith('DELETE') ||
        stmt.startsWith('MERGE')
      ) {
        await connection.commit();
      }

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
