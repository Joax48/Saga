import type { DatabaseTableDefinition } from './database-table';

const insertProjectTypeSql = `
  INSERT INTO Project_Type (
    id,
    description
  ) VALUES (?, ?)
`;

type ProjectTypeSeedRow = {
  id: number;
  description: string;
};

const projectTypeRows: ProjectTypeSeedRow[] = [
  {
    id: 1,
    description: 'Humanistico',
  },
  {
    id: 2,
    description: 'Interdisciplinario',
  },
  {
    id: 3,
    description: 'Tecnologico',
  },
];

export const projectTypeTable: DatabaseTableDefinition = {
  name: 'Project_Type',
  dropSql: 'DROP TABLE IF EXISTS Project_Type',
  createSql: `
    CREATE TABLE Project_Type (
      id INT,
      description STRING
    )
  `,
  seedSql: insertProjectTypeSql,
  seedRows: projectTypeRows.map((projectType) => ({
    params: [projectType.id, projectType.description],
  })),
};
