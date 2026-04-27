import type { DatabaseTableDefinition } from './database-table';

const insertProjectDisciplineSql = `
  INSERT INTO Project_Discipline (
    id,
    description
  ) VALUES (?, ?)
`;

type ProjectDisciplineSeedRow = {
  id: number;
  description: string;
};

const projectDisciplineRows: ProjectDisciplineSeedRow[] = [
  { id: 1, description: 'Ciencias Sociales' },
  { id: 2, description: 'Salud Publica' },
  { id: 3, description: 'Estadistica' },
  { id: 4, description: 'Ciencias Politicas' },
  { id: 5, description: 'Ingenieria Electrica' },
  { id: 6, description: 'Quimica' },
  { id: 7, description: 'Gestion Territorial' },
  { id: 8, description: 'Ecologia' },
  { id: 9, description: 'Agronomia' },
];

export const projectDisciplineTable: DatabaseTableDefinition = {
  name: 'Project_Discipline',
  dropSql: 'DROP TABLE IF EXISTS Project_Discipline',
  createSql: `
    CREATE TABLE Project_Discipline (
      id INT,
      description STRING
    )
  `,
  seedSql: insertProjectDisciplineSql,
  seedRows: projectDisciplineRows.map((row) => ({
    params: [row.id, row.description],
  })),
};
