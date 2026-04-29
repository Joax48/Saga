import type { DatabaseTableDefinition } from './database-table';

const insertProjectSql = `
  INSERT INTO Project (
    id,
    project_manager,
    project_type,
    funding_type,
    research_type,
    status,
    base_unit,
    name,
    description,
    start_date,
    end_date,
    code
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

type ProjectSeedRow = {
  id: number;
  projectManager: number;
  projectType: number;
  fundingType: number;
  researchType: number;
  status: number;
  baseUnit: number;
  name: string;
  description: string;
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
    baseUnit: 13,
    name: 'El costo de una vida digna en Costa Rica. Ingreso vital y la construccion de metodologias para el calculo de variaciones subnacionales.',
    description:
      'Analizar y mapear las variaciones subnacionales en el ingreso vital en Costa Rica mediante metodologias cuantitativas y cualitativas para apoyar la politica publica.',
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
    baseUnit: 10,
    name: 'Analisis espacio-temporal del impacto de factores climaticos y de contaminacion sobre las hospitalizaciones respiratorias',
    description:
      'Estudio del impacto de variables ambientales en la salud publica mediante analisis de datos espaciales y temporales.',
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
    baseUnit: 14,
    name: 'Metodologias para la estimacion de pobreza en areas pequenas en Costa Rica.',
    description:
      'Desarrollo de modelos estadisticos para estimar pobreza en regiones con baja disponibilidad de datos.',
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
    baseUnit: 15,
    name: 'Analisis comparativo de las encuestas de opinion a estudiantes y administrativos de la Universidad de Costa Rica 2005 y 2018.',
    description:
      'Comparacion de percepciones de estudiantes y personal administrativo para apoyar la mejora institucional de la UCR.',
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
    baseUnit: 11,
    name: 'Metodos para modelaje y mitigacion de la dependencia en modelos ocultos de Markov y semi-Markov.',
    description:
      'Investigacion sobre modelos ocultos de Markov y semi-Markov para mejorar el modelaje y la mitigacion de dependencias complejas.',
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
    baseUnit: 12,
    name: 'Sintesis de evidencia y modelos de decision complejos, aplicados al estudio dinamico de enfermedades cronicas no comunicables para la salud poblacional, considerando globalidad.',
    description:
      'Sintesis de evidencia y modelado de decisiones para apoyar el estudio de enfermedades cronicas no comunicables en salud poblacional.',
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
    baseUnit: 10,
    name: 'Aplicaciones de modelos heteroscedasticos y modelos mixtos.',
    description:
      'Aplicacion de modelos heteroscedasticos y mixtos para resolver problemas de inferencia en escenarios con alta variabilidad.',
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
    baseUnit: 7,
    name: 'Gestion de iniciativas de produccion agroecoturisticas sostenibles en la parte alta de la cuenca del rio Candelaria.',
    description:
      'Fortalecimiento de iniciativas agroecoturisticas sostenibles mediante gestion territorial en la cuenca del rio Candelaria.',
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
    baseUnit: 1,
    name: 'Monitoreo de ecosistemas forestales para el fortalecimiento de estrategias de conservacion y uso de bosques: una contribucion a la iniciativa Costa Rica Carbono Neutral',
    description:
      'Monitoreo de ecosistemas forestales para fortalecer estrategias de conservacion, mitigacion y carbono neutral.',
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
    baseUnit: 13,
    name: 'El ciclo politico electoral en los flujos migratorios en Latinoamerica.',
    description:
      'Analisis del ciclo politico electoral y su relacion con los flujos migratorios en Latinoamerica.',
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
    baseUnit: 16,
    name: 'Mejoramiento de la calidad de exportacion de Schefflera arboricola mediante el uso de reguladores quimicos de crecimiento.',
    description:
      'Evaluacion de reguladores quimicos de crecimiento para mejorar la calidad de exportacion de Schefflera arboricola.',
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
    baseUnit: 16,
    name: 'Efecto de la aplicacion de giberelinas en la concentracion de la cosecha de tres variedades de rosa (Rosa spp).',
    description:
      'Analisis del efecto de giberelinas para concentrar la cosecha de variedades de rosa en contextos productivos.',
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
      base_unit INT,
      name STRING,
      description STRING,
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
      project.baseUnit,
      project.name,
      project.description,
      project.startDate,
      project.endDate,
      project.code,
    ],
  })),
};
