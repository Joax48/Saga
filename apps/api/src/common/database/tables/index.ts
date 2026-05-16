import type { DatabaseTableDefinition } from './database-table';
import { fundingTypeTable } from './funding-type.table';
import { projectDisciplineTable } from './project-discipline.table';
import { projectDisciplineRelationTable } from './project-discipline-relation.table';
import { projectKeywordTable } from './project-keyword.table';
import { projectKeywordRelationTable } from './project-keyword-relation.table';
import { projectResearcherTable } from './project-researcher.table';
import { researcherTable } from './research.table';
import { projectStatusTable } from './project-status.table';
import { projectTable } from './project.table';
import { projectTypeTable } from './project-type.table';
import { researchTypeTable } from './research-type.table';
import { unitTable } from './unit.table';
import { scientificProductionTable } from './scientific-production.table';
import { profileAssociatedWithUnitTable } from './profile-associated-with-unit.table';

export const databaseTables: DatabaseTableDefinition[] = [
  projectDisciplineTable,
  projectKeywordTable,
  projectTypeTable,
  fundingTypeTable,
  researchTypeTable,
  projectStatusTable,
  researcherTable,
  projectTable,
  projectDisciplineRelationTable,
  projectKeywordRelationTable,
  projectResearcherTable,
  unitTable,
  scientificProductionTable,
  profileAssociatedWithUnitTable,
];
