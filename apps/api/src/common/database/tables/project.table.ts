import type { DatabaseTableDefinition } from './database-table';

const insertProjectSql = `
  INSERT INTO Project (
    id,
    project_type,
    funding_type,
    research_type,
    status,
    name,
    start_date,
    end_date,
    code
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

type ProjectSeedRow = {
  id: number;
  projectType: number;
  fundingType: number;
  researchType: number;
  status: number;
  name: string;
  startDate: string;
  endDate: string;
  code: string;
};

const projectRows: ProjectSeedRow[] = [
  {
    id: 1,
    projectType: 1,
    fundingType: 1,
    researchType: 1,
    status: 2,
    name: 'El costo de una vida digna en Costa Rica. Ingreso vital y la construccion de metodologias para el calculo de variaciones subnacionales.',
    startDate: '2023-06-01',
    endDate: '2025-12-31',
    code: 'C3992',
  },
  {
    id: 2,
    projectType: 2,
    fundingType: 2,
    researchType: 1,
    status: 2,
    name: 'Analisis espacio-temporal del impacto de factores climaticos y de contaminacion sobre las hospitalizaciones respiratorias',
    startDate: '2024-01-01',
    endDate: '2026-12-15',
    code: 'C4196',
  },
  {
    id: 3,
    projectType: 2,
    fundingType: 1,
    researchType: 1,
    status: 2,
    name: 'Metodologias para la estimacion de pobreza en areas pequenas en Costa Rica.',
    startDate: '2023-04-07',
    endDate: '2024-12-31',
    code: 'C3223',
  },
  {
    id: 4,
    projectType: 1,
    fundingType: 1,
    researchType: 1,
    status: 1,
    name: 'Analisis comparativo de las encuestas de opinion a estudiantes y administrativos de la Universidad de Costa Rica 2005 y 2018.',
    startDate: '2018-02-20',
    endDate: '2018-12-15',
    code: 'C3224',
  },
  {
    id: 5,
    projectType: 3,
    fundingType: 1,
    researchType: 1,
    status: 1,
    name: 'Metodos para modelaje y mitigacion de la dependencia en modelos ocultos de Markov y semi-Markov.',
    startDate: '2022-09-15',
    endDate: '2023-12-31',
    code: 'C2227',
  },
  {
    id: 6,
    projectType: 2,
    fundingType: 3,
    researchType: 1,
    status: 1,
    name: 'Sintesis de evidencia y modelos de decision complejos, aplicados al estudio dinamico de enfermedades cronicas no comunicables para la salud poblacional, considerando globalidad.',
    startDate: '2016-03-07',
    endDate: '2018-04-30',
    code: 'B6226',
  },
  {
    id: 7,
    projectType: 3,
    fundingType: 2,
    researchType: 1,
    status: 1,
    name: 'Aplicaciones de modelos heteroscedasticos y modelos mixtos.',
    startDate: '2015-03-01',
    endDate: '2016-07-31',
    code: 'B5227',
  },
  {
    id: 8,
    projectType: 2,
    fundingType: 1,
    researchType: 2,
    status: 1,
    name: 'Gestion de iniciativas de produccion agroecoturisticas sostenibles en la parte alta de la cuenca del rio Candelaria.',
    startDate: '2010-01-01',
    endDate: '2011-12-15',
    code: 'B0661',
  },
  {
    id: 9,
    projectType: 2,
    fundingType: 2,
    researchType: 1,
    status: 1,
    name: 'Monitoreo de ecosistemas forestales para el fortalecimiento de estrategias de conservacion y uso de bosques: una contribucion a la iniciativa Costa Rica Carbono Neutral',
    startDate: '2010-01-15',
    endDate: '2013-12-16',
    code: 'B0651',
  },
  {
    id: 10,
    projectType: 1,
    fundingType: 2,
    researchType: 1,
    status: 1,
    name: 'El ciclo politico electoral en los flujos migratorios en Latinoamerica.',
    startDate: '2008-09-01',
    endDate: '2009-06-30',
    code: 'A8205',
  },
  {
    id: 11,
    projectType: 3,
    fundingType: 2,
    researchType: 2,
    status: 1,
    name: 'Mejoramiento de la calidad de exportacion de Schefflera arboricola mediante el uso de reguladores quimicos de crecimiento.',
    startDate: '2008-03-01',
    endDate: '2009-02-28',
    code: 'A8152',
  },
  {
    id: 12,
    projectType: 3,
    fundingType: 1,
    researchType: 2,
    status: 1,
    name: 'Efecto de la aplicacion de giberelinas en la concentracion de la cosecha de tres variedades de rosa (Rosa spp).',
    startDate: '2008-03-01',
    endDate: '2009-02-28',
    code: 'A8151',
  },
];

export const projectTable: DatabaseTableDefinition = {
  name: 'Project',
  dropSql: 'DROP TABLE IF EXISTS Project',
  createSql: `
    CREATE TABLE Project (
      id INT,
      project_type INT,
      funding_type INT,
      research_type INT,
      status INT,
      name STRING,
      start_date STRING,
      end_date STRING,
      code STRING
    )
  `,
  seedSql: insertProjectSql,
  seedRows: projectRows.map((project) => ({
    params: [
      project.id,
      project.projectType,
      project.fundingType,
      project.researchType,
      project.status,
      project.name,
      project.startDate,
      project.endDate,
      project.code,
    ],
  })),
};
