import type { DatabaseTableDefinition } from './database-table';

const insertProjectKeywordRelationSql = `
  INSERT INTO Project_Keyword_Relation (
    project_id,
    keyword_id
  ) VALUES (?, ?)
`;

type ProjectKeywordRelationSeedRow = {
  projectId: number;
  keywordId: number;
};

const projectKeywordRelationRows: ProjectKeywordRelationSeedRow[] = [
  { projectId: 1, keywordId: 1 },
  { projectId: 1, keywordId: 2 },
  { projectId: 1, keywordId: 3 },
  { projectId: 1, keywordId: 4 },
  { projectId: 2, keywordId: 5 },
  { projectId: 2, keywordId: 6 },
  { projectId: 2, keywordId: 7 },
  { projectId: 2, keywordId: 8 },
  { projectId: 3, keywordId: 9 },
  { projectId: 3, keywordId: 1 },
  { projectId: 3, keywordId: 10 },
  { projectId: 3, keywordId: 11 },
  { projectId: 4, keywordId: 12 },
  { projectId: 4, keywordId: 13 },
  { projectId: 4, keywordId: 14 },
  { projectId: 4, keywordId: 15 },
  { projectId: 5, keywordId: 16 },
  { projectId: 5, keywordId: 17 },
  { projectId: 5, keywordId: 18 },
  { projectId: 5, keywordId: 19 },
  { projectId: 6, keywordId: 20 },
  { projectId: 6, keywordId: 21 },
  { projectId: 6, keywordId: 22 },
  { projectId: 6, keywordId: 23 },
  { projectId: 7, keywordId: 24 },
  { projectId: 7, keywordId: 25 },
  { projectId: 7, keywordId: 26 },
  { projectId: 7, keywordId: 27 },
  { projectId: 8, keywordId: 28 },
  { projectId: 8, keywordId: 29 },
  { projectId: 8, keywordId: 30 },
  { projectId: 8, keywordId: 31 },
  { projectId: 9, keywordId: 32 },
  { projectId: 9, keywordId: 33 },
  { projectId: 9, keywordId: 34 },
  { projectId: 9, keywordId: 35 },
  { projectId: 10, keywordId: 36 },
  { projectId: 10, keywordId: 37 },
  { projectId: 10, keywordId: 38 },
  { projectId: 10, keywordId: 39 },
  { projectId: 11, keywordId: 40 },
  { projectId: 11, keywordId: 41 },
  { projectId: 11, keywordId: 42 },
  { projectId: 11, keywordId: 43 },
  { projectId: 12, keywordId: 44 },
  { projectId: 12, keywordId: 45 },
  { projectId: 12, keywordId: 46 },
  { projectId: 12, keywordId: 47 },
];

export const projectKeywordRelationTable: DatabaseTableDefinition = {
  name: 'Project_Keyword_Relation',
  dropSql: 'DROP TABLE IF EXISTS Project_Keyword_Relation',
  createSql: `
    CREATE TABLE Project_Keyword_Relation (
      project_id INT,
      keyword_id INT
    )
  `,
  seedSql: insertProjectKeywordRelationSql,
  seedRows: projectKeywordRelationRows.map((row) => ({
    params: [row.projectId, row.keywordId],
  })),
};
