import type { DatabaseTableDefinition } from './database-table';
import { fundingTypeTable } from './funding-type.table';
import { projectDisciplineTable } from './project-discipline.table';
import { projectDisciplineRelationTable } from './project-discipline-relation.table';
import { projectResearcherTable } from './project-researcher.table';
import { researcherTable } from './research.table';
import { projectStatusTable } from './project-status.table';
import { projectTable } from './project.table';
import { projectTypeTable } from './project-type.table';
import { researchTypeTable } from './research-type.table';
import { unitTable } from './unit.table';
import { scientificProductionTable } from './scientific-production.table';

export const databaseTables: DatabaseTableDefinition[] = [
  projectDisciplineTable,
  projectTypeTable,
  fundingTypeTable,
  researchTypeTable,
  projectStatusTable,
  researcherTable,
  projectTable,
  projectDisciplineRelationTable,
  projectResearcherTable,
  unitTable,
  scientificProductionTable,
];
