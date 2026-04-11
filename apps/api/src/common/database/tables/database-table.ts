export interface DatabaseTableDefinition {
  name: string;
  dropSql: string;
  createSql: string;
  seedSql: string;
  seedRows: Array<{
    params?: unknown[];
  }>;
}
