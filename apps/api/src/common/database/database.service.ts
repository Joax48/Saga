import { Injectable } from '@nestjs/common';
import alasql from 'alasql';
import { databaseTables } from './tables';

@Injectable()
export class DatabaseService {
  private readonly databaseName = 'saga_db_mock';

  constructor() {
    this.initialize();
  }

  async query<T>(text: string, params: unknown[] = []): Promise<T[]> {
    const rows = alasql(text, params) as T[];
    return rows;
  }

  private initialize(): void {
    alasql(`CREATE DATABASE IF NOT EXISTS ${this.databaseName}`);
    alasql(`USE ${this.databaseName}`);

    this.resetTables();
    this.createTables();
    this.seedTables();
  }

  private resetTables(): void {
    for (const table of [...databaseTables].reverse()) {
      alasql(table.dropSql);
    }
  }

  private createTables(): void {
    for (const table of databaseTables) {
      alasql(table.createSql);
    }
  }

  private seedTables(): void {
    for (const table of databaseTables) {
      for (const seedRow of table.seedRows) {
        alasql(table.seedSql, seedRow.params ?? []);
      }
    }
  }
}
