import type { DatabaseTableDefinition } from './database-table';

const insertProjectStatusSql = `
  INSERT INTO Project_Status (
    id,
    description
  ) VALUES (?, ?)
`;

type ProjectStatusSeedRow = {
  id: number;
  description: string;
};

const projectStatusRows: ProjectStatusSeedRow[] = [
  {
    id: 1,
    description: 'Finalizado',
  },
  {
    id: 2,
    description: 'Activo',
  },
  {
    id: 3,
    description: 'Vencido',
  },
];

export const projectStatusTable: DatabaseTableDefinition = {
  name: 'Project_Status',
  dropSql: 'DROP TABLE IF EXISTS Project_Status',
  createSql: `
    CREATE TABLE Project_Status (
      id INT,
      description STRING
    )
  `,
  seedSql: insertProjectStatusSql,
  seedRows: projectStatusRows.map((projectStatus) => ({
    params: [projectStatus.id, projectStatus.description],
  })),
};
