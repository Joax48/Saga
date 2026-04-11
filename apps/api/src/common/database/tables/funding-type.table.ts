import type { DatabaseTableDefinition } from './database-table';

const insertFundingTypeSql = `
  INSERT INTO Funding_Type (
    id,
    description
  ) VALUES (?, ?)
`;

type FundingTypeSeedRow = {
  id: number;
  description: string;
};

const fundingTypeRows: FundingTypeSeedRow[] = [
  {
    id: 1,
    description: 'Fondos internos',
  },
  {
    id: 2,
    description: 'Fondos externos',
  },
  {
    id: 3,
    description: 'Cooperacion internacional',
  },
];

export const fundingTypeTable: DatabaseTableDefinition = {
  name: 'Funding_Type',
  dropSql: 'DROP TABLE IF EXISTS Funding_Type',
  createSql: `
    CREATE TABLE Funding_Type (
      id INT,
      description STRING
    )
  `,
  seedSql: insertFundingTypeSql,
  seedRows: fundingTypeRows.map((fundingType) => ({
    params: [fundingType.id, fundingType.description],
  })),
};
