import type { DatabaseTableDefinition } from './database-table';

const insertProjectResearcherSql = `
  INSERT INTO Project_Researcher (
    project_id,
    researcher_id,
    role
  ) VALUES (?, ?, ?)
`;

type ProjectResearcherSeedRow = {
  projectId: number;
  researcherId: number;
  role: string;
};

const projectResearcherRows: ProjectResearcherSeedRow[] = [
  { projectId: 1, researcherId: 2, role: 'Investigador principal' },
  { projectId: 1, researcherId: 12, role: 'Co-investigadora' },
  { projectId: 2, researcherId: 3, role: 'Investigador principal' },
  { projectId: 2, researcherId: 1, role: 'Co-investigadora' },
  { projectId: 3, researcherId: 1, role: 'Investigadora principal' },
  { projectId: 4, researcherId: 4, role: 'Investigador principal' },
  { projectId: 5, researcherId: 8, role: 'Investigador principal' },
  { projectId: 5, researcherId: 10, role: 'Colaborador' },
  { projectId: 6, researcherId: 9, role: 'Investigadora principal' },
  { projectId: 6, researcherId: 11, role: 'Asistente de investigacion' },
  { projectId: 7, researcherId: 3, role: 'Investigador principal' },
  { projectId: 7, researcherId: 6, role: 'Co-investigador' },
  { projectId: 8, researcherId: 4, role: 'Coordinador' },
  { projectId: 8, researcherId: 5, role: 'Colaboradora' },
  { projectId: 9, researcherId: 2, role: 'Investigador principal' },
  { projectId: 9, researcherId: 7, role: 'Investigadora asociada' },
  { projectId: 10, researcherId: 2, role: 'Investigador principal' },
  { projectId: 10, researcherId: 4, role: 'Colaborador' },
  { projectId: 11, researcherId: 1, role: 'Investigadora principal' },
  { projectId: 11, researcherId: 7, role: 'Colaboradora' },
  { projectId: 12, researcherId: 5, role: 'Investigador principal' },
  { projectId: 12, researcherId: 6, role: 'Colaborador' },
];

export const projectResearcherTable: DatabaseTableDefinition = {
  name: 'Project_Researcher',
  dropSql: 'DROP TABLE IF EXISTS Project_Researcher',
  createSql: `
    CREATE TABLE Project_Researcher (
      project_id INT,
      researcher_id INT,
      role STRING
    )
  `,
  seedSql: insertProjectResearcherSql,
  seedRows: projectResearcherRows.map((row) => ({
    params: [row.projectId, row.researcherId, row.role],
  })),
};
