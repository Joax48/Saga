import type { DatabaseTableDefinition } from './database-table';

const insertProjectKeywordSql = `
  INSERT INTO Project_Keyword (
    id,
    description
  ) VALUES (?, ?)
`;

type ProjectKeywordSeedRow = {
  id: number;
  description: string;
};

const projectKeywordRows: ProjectKeywordSeedRow[] = [
  { id: 1, description: 'pobreza' },
  { id: 2, description: 'economia social' },
  { id: 3, description: 'politica publica' },
  { id: 4, description: 'costa rica' },
  { id: 5, description: 'clima' },
  { id: 6, description: 'salud publica' },
  { id: 7, description: 'modelado espacial' },
  { id: 8, description: 'contaminacion' },
  { id: 9, description: 'estadistica' },
  { id: 10, description: 'areas pequenas' },
  { id: 11, description: 'metodologia' },
  { id: 12, description: 'encuestas' },
  { id: 13, description: 'opinion publica' },
  { id: 14, description: 'universidad' },
  { id: 15, description: 'analisis comparativo' },
  { id: 16, description: 'markov' },
  { id: 17, description: 'modelos ocultos' },
  { id: 18, description: 'dependencia' },
  { id: 19, description: 'metodos cuantitativos' },
  { id: 20, description: 'salud poblacional' },
  { id: 21, description: 'enfermedades cronicas' },
  { id: 22, description: 'sintesis de evidencia' },
  { id: 23, description: 'decision' },
  { id: 24, description: 'modelos mixtos' },
  { id: 25, description: 'heteroscedasticidad' },
  { id: 26, description: 'estadistica aplicada' },
  { id: 27, description: 'analisis' },
  { id: 28, description: 'agroecoturismo' },
  { id: 29, description: 'sostenibilidad' },
  { id: 30, description: 'gestion territorial' },
  { id: 31, description: 'cuencas' },
  { id: 32, description: 'bosques' },
  { id: 33, description: 'conservacion' },
  { id: 34, description: 'carbono neutral' },
  { id: 35, description: 'monitoreo ambiental' },
  { id: 36, description: 'migracion' },
  { id: 37, description: 'politica electoral' },
  { id: 38, description: 'latinoamerica' },
  { id: 39, description: 'ciencias sociales' },
  { id: 40, description: 'agronomia' },
  { id: 41, description: 'exportacion' },
  { id: 42, description: 'reguladores de crecimiento' },
  { id: 43, description: 'calidad' },
  { id: 44, description: 'giberelinas' },
  { id: 45, description: 'rosa' },
  { id: 46, description: 'horticultura' },
  { id: 47, description: 'cosecha' },
];

export const projectKeywordTable: DatabaseTableDefinition = {
  name: 'Project_Keyword',
  dropSql: 'DROP TABLE IF EXISTS Project_Keyword',
  createSql: `
    CREATE TABLE Project_Keyword (
      id INT,
      description STRING
    )
  `,
  seedSql: insertProjectKeywordSql,
  seedRows: projectKeywordRows.map((row) => ({
    params: [row.id, row.description],
  })),
};
