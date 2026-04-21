import type { DatabaseTableDefinition } from './database-table';

const insertProjectSql = `
  INSERT INTO Project (
    id,
    project_manager,
    project_type,
    funding_type,
    research_type,
    status,
    name,
    keywords,
    start_date,
    end_date,
    code
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

type ProjectSeedRow = {
  id: number;
  projectManager: number;
  projectType: number;
  fundingType: number;
  researchType: number;
  status: number;
  name: string;
  keywords: string;
  startDate: string;
  endDate: string;
  code: string;
};

const projectRows: ProjectSeedRow[] = [
  {
    id: 1,
    projectManager: 2,
    projectType: 1,
    fundingType: 1,
    researchType: 1,
    status: 2,
    name: 'El costo de una vida digna en Costa Rica. Ingreso vital y la construccion de metodologias para el calculo de variaciones subnacionales.',
    keywords: 'pobreza,economia social,politica publica,costa rica',
    startDate: '2023-06-01',
    endDate: '2025-12-31',
    code: 'C3992',
  },
  {
    id: 2,
    projectManager: 3,
    projectType: 2,
    fundingType: 2,
    researchType: 1,
    status: 2,
    name: 'Analisis espacio-temporal del impacto de factores climaticos y de contaminacion sobre las hospitalizaciones respiratorias',
    keywords: 'clima,salud publica,modelado espacial,contaminacion',
    startDate: '2024-01-01',
    endDate: '2026-12-15',
    code: 'C4196',
  },
  {
    id: 3,
    projectManager: 1,
    projectType: 2,
    fundingType: 1,
    researchType: 1,
    status: 2,
    name: 'Metodologias para la estimacion de pobreza en areas pequenas en Costa Rica.',
    keywords: 'estadistica,pobreza,areas pequenas,metodologia',
    startDate: '2023-04-07',
    endDate: '2024-12-31',
    code: 'C3223',
  },
  {
    id: 4,
    projectManager: 4,
    projectType: 1,
    fundingType: 1,
    researchType: 1,
    status: 1,
    name: 'Analisis comparativo de las encuestas de opinion a estudiantes y administrativos de la Universidad de Costa Rica 2005 y 2018.',
    keywords: 'encuestas,opinion publica,universidad,analisis comparativo',
    startDate: '2018-02-20',
    endDate: '2018-12-15',
    code: 'C3224',
  },
  {
    id: 5,
    projectManager: 8,
    projectType: 3,
    fundingType: 1,
    researchType: 1,
    status: 1,
    name: 'Metodos para modelaje y mitigacion de la dependencia en modelos ocultos de Markov y semi-Markov.',
    keywords: 'markov,modelos ocultos,dependencia,metodos cuantitativos',
    startDate: '2022-09-15',
    endDate: '2023-12-31',
    code: 'C2227',
  },
  {
    id: 6,
    projectManager: 9,
    projectType: 2,
    fundingType: 3,
    researchType: 1,
    status: 1,
    name: 'Sintesis de evidencia y modelos de decision complejos, aplicados al estudio dinamico de enfermedades cronicas no comunicables para la salud poblacional, considerando globalidad.',
    keywords: 'salud poblacional,enfermedades cronicas,sintesis de evidencia,decision',
    startDate: '2016-03-07',
    endDate: '2018-04-30',
    code: 'B6226',
  },
  {
    id: 7,
    projectManager: 3,
    projectType: 3,
    fundingType: 2,
    researchType: 1,
    status: 1,
    name: 'Aplicaciones de modelos heteroscedasticos y modelos mixtos.',
    keywords: 'modelos mixtos,heteroscedasticidad,estadistica aplicada,analisis',
    startDate: '2015-03-01',
    endDate: '2016-07-31',
    code: 'B5227',
  },
  {
    id: 8,
    projectManager: 4,
    projectType: 2,
    fundingType: 1,
    researchType: 2,
    status: 1,
    name: 'Gestion de iniciativas de produccion agroecoturisticas sostenibles en la parte alta de la cuenca del rio Candelaria.',
    keywords: 'agroecoturismo,sostenibilidad,gestion territorial,cuencas',
    startDate: '2010-01-01',
    endDate: '2011-12-15',
    code: 'B0661',
  },
  {
    id: 9,
    projectManager: 2,
    projectType: 2,
    fundingType: 2,
    researchType: 1,
    status: 1,
    name: 'Monitoreo de ecosistemas forestales para el fortalecimiento de estrategias de conservacion y uso de bosques: una contribucion a la iniciativa Costa Rica Carbono Neutral',
    keywords: 'bosques,conservacion,carbono neutral,monitoreo ambiental',
    startDate: '2010-01-15',
    endDate: '2013-12-16',
    code: 'B0651',
  },
  {
    id: 10,
    projectManager: 3,
    projectType: 1,
    fundingType: 2,
    researchType: 1,
    status: 1,
    name: 'El ciclo politico electoral en los flujos migratorios en Latinoamerica.',
    keywords: 'migracion,politica electoral,latinoamerica,ciencias sociales',
    startDate: '2008-09-01',
    endDate: '2009-06-30',
    code: 'A8205',
  },
  {
    id: 11,
    projectManager: 1,
    projectType: 3,
    fundingType: 2,
    researchType: 2,
    status: 1,
    name: 'Mejoramiento de la calidad de exportacion de Schefflera arboricola mediante el uso de reguladores quimicos de crecimiento.',
    keywords: 'agronomia,exportacion,reguladores de crecimiento,calidad',
    startDate: '2008-03-01',
    endDate: '2009-02-28',
    code: 'A8152',
  },
  {
    id: 12,
    projectManager: 5,
    projectType: 3,
    fundingType: 1,
    researchType: 2,
    status: 1,
    name: 'Efecto de la aplicacion de giberelinas en la concentracion de la cosecha de tres variedades de rosa (Rosa spp).',
    keywords: 'giberelinas,rosa,horticultura,cosecha',
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
      project_manager INT,
      project_type INT,
      funding_type INT,
      research_type INT,
      status INT,
      name STRING,
      keywords STRING,
      start_date STRING,
      end_date STRING,
      code STRING
    )
  `,
  seedSql: insertProjectSql,
  seedRows: projectRows.map((project) => ({
    params: [
      project.id,
      project.projectManager,
      project.projectType,
      project.fundingType,
      project.researchType,
      project.status,
      project.name,
      project.keywords,
      project.startDate,
      project.endDate,
      project.code,
    ],
  })),
};
