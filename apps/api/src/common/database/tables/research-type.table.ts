import type { DatabaseTableDefinition } from './database-table';

const insertResearchTypeSql = `
  INSERT INTO Research_Type (
    id,
    description
  ) VALUES (?, ?)
`;

type ResearchTypeSeedRow = {
  id: number;
  description: string;
};

const researchTypeRows: ResearchTypeSeedRow[] = [
  {
    id: 1,
    description: 'Basica',
  },
  {
    id: 2,
    description: 'Aplicada',
  },
];

export const researchTypeTable: DatabaseTableDefinition = {
  name: 'Research_Type',
  dropSql: 'DROP TABLE IF EXISTS Research_Type',
  createSql: `
    CREATE TABLE Research_Type (
      id INT,
      description STRING
    )
  `,
  seedSql: insertResearchTypeSql,
  seedRows: researchTypeRows.map((researchType) => ({
    params: [researchType.id, researchType.description],
  })),
};
