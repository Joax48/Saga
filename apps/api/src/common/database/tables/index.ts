import type { DatabaseTableDefinition } from './database-table';
import { fundingTypeTable } from './funding-type.table';
import { researcherTable } from './research.table';
import { projectStatusTable } from './project-status.table';
import { projectTable } from './project.table';
import { projectTypeTable } from './project-type.table';
import { researchTypeTable } from './research-type.table';
import { unitTable } from './unit.table';
import { scientificProductionTable } from './scientific-production.table';

export const databaseTables: DatabaseTableDefinition[] = [
  projectTypeTable,
  fundingTypeTable,
  researchTypeTable,
  projectStatusTable,
  researcherTable,
  projectTable,
  unitTable,
  scientificProductionTable,
];
