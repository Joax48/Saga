import type { DatabaseTableDefinition } from './database-table';

const insertProjectDisciplineRelationSql = `
  INSERT INTO Project_Discipline_Relation (
    project_id,
    discipline_id
  ) VALUES (?, ?)
`;

type ProjectDisciplineRelationSeedRow = {
  projectId: number;
  disciplineId: number;
};

const projectDisciplineRelationRows: ProjectDisciplineRelationSeedRow[] = [
  { projectId: 1, disciplineId: 1 },
  { projectId: 1, disciplineId: 3 },
  { projectId: 2, disciplineId: 2 },
  { projectId: 2, disciplineId: 3 },
  { projectId: 3, disciplineId: 3 },
  { projectId: 4, disciplineId: 4 },
  { projectId: 5, disciplineId: 5 },
  { projectId: 6, disciplineId: 2 },
  { projectId: 6, disciplineId: 6 },
  { projectId: 7, disciplineId: 3 },
  { projectId: 8, disciplineId: 7 },
  { projectId: 8, disciplineId: 8 },
  { projectId: 9, disciplineId: 8 },
  { projectId: 10, disciplineId: 1 },
  { projectId: 10, disciplineId: 4 },
  { projectId: 11, disciplineId: 9 },
  { projectId: 12, disciplineId: 9 },
];

export const projectDisciplineRelationTable: DatabaseTableDefinition = {
  name: 'Project_Discipline_Relation',
  dropSql: 'DROP TABLE IF EXISTS Project_Discipline_Relation',
  createSql: `
    CREATE TABLE Project_Discipline_Relation (
      project_id INT,
      discipline_id INT
    )
  `,
  seedSql: insertProjectDisciplineRelationSql,
  seedRows: projectDisciplineRelationRows.map((row) => ({
    params: [row.projectId, row.disciplineId],
  })),
};
