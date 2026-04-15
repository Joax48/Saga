// =========================
// TYPES
// =========================

export interface Project {
  id: string;
  code: string;
  title: string;
  description: string;
  manager: string;
  institute: string;
  discipline: string;
  researchType: string;
  projectType: string;
  fundingType: string;
  status: string;
  startDate: string;
  endDate: string;
  keywords: string[];
  associatedProfiles: Array<{
    id: string;
    name: string;
    role?: string;
  }>;
}

export interface FilterOption {
  label: string;
  count: number;
  value: string;
}

export interface ProjectFilters {
  researchType: FilterOption[];
  projectType: FilterOption[];
  startYear: FilterOption[];
  status: FilterOption[];
  participants: FilterOption[];
  keywords: FilterOption[];
}

export interface PaginatedProjects {
  data: Project[];
  total: number;
  page: number;
  limit: number;
}

export interface ProjectQueryFilters {
  researchType?: string[];
  projectType?: string[];
  startYear?: string[];
  status?: string[];
  participants?: string[];
  keywords?: string[];
}

// =========================
// MOCK DATA
// =========================

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    code: 'C3992',
    title:
      'El costo de una vida digna en Costa Rica. Ingreso vital y la construcción de metodologías para el cálculo de variaciones subnacionales.',
    description:
      'Analizar y mapear las variaciones subnacionales en el ingreso vital en Costa Rica mediante metodologías cuantitativas y cualitativas para apoyar la política pública.',
    manager: 'Koen Voorend',
    institute: 'Instituto de Investigaciones Sociales',
    discipline: 'Ciencias Sociales',
    researchType: 'Básica',
    projectType: 'Proyecto',
    fundingType: 'Financiamiento UCREA',
    status: 'Vencido',
    startDate: '2023-06-01',
    endDate: '2025-12-31',
    keywords: ['Ingreso vital', 'Costo de vida', 'Desigualdad'],
    associatedProfiles: [
      { id: 'r1', name: 'Koen Voorend', role: 'Investigador principal' },
      { id: 'r2', name: 'María Pérez' },
    ],
  },
  {
    id: '2',
    code: 'C4196',
    title:
      'Análisis espacio-temporal del impacto de factores climáticos y contaminación en hospitalizaciones respiratorias.',
    description:
      'Estudio del impacto de variables ambientales en la salud pública mediante análisis de datos espaciales y temporales.',
    manager: 'Shu Wei Chou Chen',
    institute: 'Escuela de Estadística',
    discipline: 'Salud Pública',
    researchType: 'Básica',
    projectType: 'Proyecto',
    fundingType: 'Fondos Internos',
    status: 'Activo',
    startDate: '2024-01-01',
    endDate: '2026-12-31',
    keywords: ['Clima', 'Salud', 'Contaminación'],
    associatedProfiles: [
      { id: 'r3', name: 'Shu Wei Chou Chen', role: 'Investigador principal' },
    ],
  },
  {
    id: '3',
    code: 'C3223',
    title: 'Metodologías para la estimación de pobreza en áreas pequeñas en Costa Rica.',
    description:
      'Desarrollo de modelos estadísticos para estimar pobreza en regiones con baja disponibilidad de datos.',
    manager: 'Alejandra Arias Salazar',
    institute: 'Escuela de Matemática',
    discipline: 'Estadística',
    researchType: 'Aplicada',
    projectType: 'Proyecto',
    fundingType: 'CONARE',
    status: 'Finalizado',
    startDate: '2023-04-07',
    endDate: '2024-12-31',
    keywords: ['Pobreza', 'Estadística', 'Modelos'],
    associatedProfiles: [{ id: 'r4', name: 'Alejandra Arias Salazar' }],
  },
  {
    id: '4',
    code: 'C2227',
    title:
      'Métodos para modelaje y mitigación de la dependencia en modelos ocultos de Markov y semi-Markov.',
    description:
      'Diseño y comparación de técnicas estadísticas para capturar dependencia temporal en procesos con estados ocultos y eventos repetidos.',
    manager: 'Shirley Elena Rojas Salazar',
    institute: 'Escuela de Matemática',
    discipline: 'Probabilidad y Estadística',
    researchType: 'Básica',
    projectType: 'Proyecto',
    fundingType: 'Fondos Internos',
    status: 'Finalizado',
    startDate: '2022-09-15',
    endDate: '2023-12-31',
    keywords: ['Markov', 'Modelos', 'Probabilidad', 'Simulación'],
    associatedProfiles: [
      { id: 'r5', name: 'Shirley Elena Rojas Salazar', role: 'Investigadora principal' },
      { id: 'r6', name: 'Daniel Segura Vargas' },
    ],
  },
  {
    id: '5',
    code: 'C5410',
    title:
      'Estrategias de economía circular para la gestión de residuos agroindustriales en cantones costeros.',
    description:
      'Evaluación de cadenas de valor y prototipos de aprovechamiento de residuos para reducir carga ambiental y generar subproductos útiles.',
    manager: 'Daniela Vargas Mora',
    institute: 'Centro de Investigación en Desarrollo Sostenible',
    discipline: 'Ingeniería Ambiental',
    researchType: 'Aplicada',
    projectType: 'Proyecto',
    fundingType: 'CONARE',
    status: 'Activo',
    startDate: '2024-03-01',
    endDate: '2026-12-31',
    keywords: ['Residuos', 'Economía circular', 'Agroindustria', 'Sostenibilidad'],
    associatedProfiles: [
      { id: 'r7', name: 'Daniela Vargas Mora', role: 'Investigadora principal' },
      { id: 'r8', name: 'Luis Fernando Solís' },
    ],
  },
  {
    id: '6',
    code: 'C5078',
    title:
      'Plataforma de análisis de movilidad urbana para la optimización de rutas de transporte público.',
    description:
      'Integración de datos de aforo, tiempos de viaje y patrones de demanda para proponer mejoras operativas en corredores urbanos.',
    manager: 'Carlos Andrés Quesada',
    institute: 'Escuela de Ingeniería Civil',
    discipline: 'Transporte y Movilidad',
    researchType: 'Aplicada',
    projectType: 'Proyecto',
    fundingType: 'Fondos Externos',
    status: 'Activo',
    startDate: '2025-01-10',
    endDate: '2027-06-30',
    keywords: ['Movilidad', 'Transporte', 'Rutas', 'Ciudades'],
    associatedProfiles: [
      { id: 'r9', name: 'Carlos Andrés Quesada', role: 'Investigador principal' },
      { id: 'r10', name: 'Paola Sánchez Jiménez' },
    ],
  },
  {
    id: '7',
    code: 'C6125',
    title:
      'Caracterización de microplásticos en fuentes de agua potable de la Gran Área Metropolitana.',
    description:
      'Monitoreo experimental y análisis de laboratorio para identificar concentraciones, composición y posibles rutas de ingreso al sistema hídrico.',
    manager: 'Melissa Porras Rojas',
    institute: 'Instituto de Investigaciones en Salud',
    discipline: 'Ciencias Ambientales',
    researchType: 'Básica',
    projectType: 'Proyecto',
    fundingType: 'Financiamiento UCREA',
    status: 'Activo',
    startDate: '2024-08-15',
    endDate: '2026-08-14',
    keywords: ['Microplásticos', 'Agua', 'Contaminación', 'Salud'],
    associatedProfiles: [
      { id: 'r11', name: 'Melissa Porras Rojas', role: 'Investigadora principal' },
      { id: 'r12', name: 'Javier Morales Pérez' },
    ],
  },
  {
    id: '8',
    code: 'C4789',
    title:
      'Desarrollo de herramientas de apoyo para la enseñanza de programación estadística en cursos introductorios.',
    description:
      'Creación de materiales, guías interactivas y ejercicios automatizados para fortalecer el aprendizaje de R y Python en estudiantes de primer ingreso.',
    manager: 'Esteban Calderón Umaña',
    institute: 'Escuela de Estadística',
    discipline: 'Educación Matemática',
    researchType: 'Aplicada',
    projectType: 'Acción',
    fundingType: 'Fondos Internos',
    status: 'Finalizado',
    startDate: '2023-02-01',
    endDate: '2024-11-30',
    keywords: ['Educación', 'Programación', 'Estadística', 'Aprendizaje'],
    associatedProfiles: [
      { id: 'r13', name: 'Esteban Calderón Umaña', role: 'Coordinador' },
      { id: 'r14', name: 'Sofía Brenes León' },
    ],
  },
  {
    id: '9',
    code: 'C5902',
    title:
      'Observatorio de precios y accesibilidad alimentaria en hogares de bajos ingresos.',
    description:
      'Seguimiento periódico de canastas básicas y patrones de consumo para analizar el impacto de la inflación en la seguridad alimentaria.',
    manager: 'Nadia Villalobos Chacón',
    institute: 'Instituto de Investigaciones Económicas',
    discipline: 'Economía',
    researchType: 'Básica',
    projectType: 'Proyecto',
    fundingType: 'CONARE',
    status: 'Activo',
    startDate: '2025-05-01',
    endDate: '2027-04-30',
    keywords: ['Alimentos', 'Pobreza', 'Inflación', 'Consumo'],
    associatedProfiles: [
      { id: 'r15', name: 'Nadia Villalobos Chacón', role: 'Investigadora principal' },
      { id: 'r16', name: 'Andrés Molina Herrera' },
    ],
  },
  {
    id: '10',
    code: 'C6344',
    title:
      'Modelos predictivos para la detección temprana de enfermedades crónicas mediante registros clínicos anonimizados.',
    description:
      'Uso de aprendizaje automático y validación estadística para identificar patrones asociados a riesgo cardiometabólico.',
    manager: 'Karla Montero León',
    institute: 'Facultad de Medicina',
    discipline: 'Salud Pública',
    researchType: 'Aplicada',
    projectType: 'Proyecto',
    fundingType: 'Fondos Externos',
    status: 'Activo',
    startDate: '2024-10-01',
    endDate: '2026-09-30',
    keywords: ['Salud', 'Predicción', 'Datos clínicos', 'Machine Learning'],
    associatedProfiles: [
      { id: 'r17', name: 'Karla Montero León', role: 'Investigadora principal' },
      { id: 'r18', name: 'Ricardo Brenes Soto' },
    ],
  },
  {
    id: '11',
    code: 'C6501',
    title:
      'Dinámicas de participación ciudadana en plataformas digitales de gobierno abierto.',
    description:
      'Análisis de interacción, accesibilidad y confianza institucional en servicios digitales utilizados por la población.',
    manager: 'Paula Jiménez Araya',
    institute: 'Escuela de Ciencias Políticas',
    discipline: 'Ciencias Políticas',
    researchType: 'Básica',
    projectType: 'Acción',
    fundingType: 'Fondos Internos',
    status: 'No iniciado',
    startDate: '2026-01-15',
    endDate: '2027-12-15',
    keywords: [
      'Ciudadanía',
      'Gobierno abierto',
      'Plataformas digitales',
      'Participación',
    ],
    associatedProfiles: [
      { id: 'r19', name: 'Paula Jiménez Araya', role: 'Coordinadora' },
      { id: 'r20', name: 'Verónica Cerdas Campos' },
    ],
  },
  {
    id: '12',
    code: 'C7018',
    title:
      'Inventario y priorización de corredores biológicos urbanos para la conectividad ecológica.',
    description:
      'Levantamiento de información territorial para jerarquizar zonas de conservación y restauración en áreas urbanizadas.',
    manager: 'Jorge Alberto Ureña',
    institute: 'Centro de Investigación en Biodiversidad',
    discipline: 'Ecología',
    researchType: 'Aplicada',
    projectType: 'Proyecto',
    fundingType: 'Financiamiento UCREA',
    status: 'Finalizado',
    startDate: '2022-11-01',
    endDate: '2024-10-31',
    keywords: ['Biodiversidad', 'Corredores biológicos', 'Ecología', 'Restauración'],
    associatedProfiles: [
      { id: 'r21', name: 'Jorge Alberto Ureña', role: 'Investigador principal' },
      { id: 'r22', name: 'Carolina Méndez Ruiz' },
    ],
  },
  {
    id: '13',
    code: 'C7241',
    title:
      'Programa piloto para integración de energía comunitaria en microredes rurales.',
    description:
      'Evaluación técnica y social de esquemas de generación distribuida para mejorar continuidad y acceso energético en comunidades aisladas.',
    manager: 'Andrea Coto Ramírez',
    institute: 'Escuela de Ingeniería Eléctrica',
    discipline: 'Energía y Desarrollo',
    researchType: 'Exploratoria',
    projectType: 'Programa',
    fundingType: 'Fondos Externos',
    status: 'Activo',
    startDate: '2025-02-01',
    endDate: '2027-01-31',
    keywords: ['Energía', 'Microredes', 'Comunidades rurales', 'Sostenibilidad'],
    associatedProfiles: [
      { id: 'r23', name: 'Andrea Coto Ramírez', role: 'Investigadora principal' },
      { id: 'r24', name: 'Gabriel Acuña Mora' },
    ],
  },
  {
    id: '14',
    code: 'C7350',
    title:
      'Iniciativa de diseño de prototipos para monitoreo de suelos agrícolas con sensores de bajo costo.',
    description:
      'Desarrollo de dispositivos y tableros de visualización para apoyar decisiones de riego y fertilización en fincas de pequeña escala.',
    manager: 'Mauricio Zúñiga Solano',
    institute: 'Escuela de Ingeniería Agrícola',
    discipline: 'Agrotecnología',
    researchType: 'Desarrollo',
    projectType: 'Iniciativa',
    fundingType: 'Fondos Internos',
    status: 'No iniciado',
    startDate: '2026-03-15',
    endDate: '2028-03-14',
    keywords: ['Sensores', 'Agricultura', 'Suelos', 'Innovación'],
    associatedProfiles: [
      { id: 'r25', name: 'Mauricio Zúñiga Solano', role: 'Coordinador' },
      { id: 'r26', name: 'Diana Castillo Rojas' },
    ],
  },
  {
    id: '15',
    code: 'C7428',
    title:
      'Exploración de narrativas de salud mental juvenil en entornos educativos públicos.',
    description:
      'Estudio cualitativo y mixto para identificar factores de riesgo, redes de apoyo y barreras de acceso a servicios de acompañamiento psicosocial.',
    manager: 'Lucía Varela Campos',
    institute: 'Escuela de Psicología',
    discipline: 'Salud Mental',
    researchType: 'Exploratoria',
    projectType: 'Proyecto',
    fundingType: 'CONARE',
    status: 'Finalizado',
    startDate: '2023-01-10',
    endDate: '2024-09-30',
    keywords: ['Salud mental', 'Juventud', 'Educación', 'Bienestar'],
    associatedProfiles: [
      { id: 'r27', name: 'Lucía Varela Campos', role: 'Investigadora principal' },
      { id: 'r28', name: 'Kevin Rodríguez Solís' },
    ],
  },
  {
    id: '16',
    code: 'C7589',
    title:
      'Programa de desarrollo de herramientas de interoperabilidad para datos científicos abiertos.',
    description:
      'Implementación de estándares, APIs y validadores para facilitar intercambio de datos entre laboratorios y repositorios institucionales.',
    manager: 'Fernando Salas Núñez',
    institute: 'Centro de Informática',
    discipline: 'Ciencia de Datos',
    researchType: 'Desarrollo',
    projectType: 'Programa',
    fundingType: 'Financiamiento UCREA',
    status: 'Activo',
    startDate: '2024-05-20',
    endDate: '2026-12-31',
    keywords: ['Datos abiertos', 'Interoperabilidad', 'APIs', 'Investigación'],
    associatedProfiles: [
      { id: 'r29', name: 'Fernando Salas Núñez', role: 'Investigador principal' },
      { id: 'r30', name: 'Natalia Solano Vega' },
    ],
  },
  {
    id: '17',
    code: 'C7693',
    title:
      'Iniciativa para cartografía participativa de riesgo por inundaciones en cuencas urbanas.',
    description:
      'Articulación con municipalidades y comunidades para producir mapas de riesgo y protocolos de respuesta temprana ante eventos extremos.',
    manager: 'Raúl Ávila Hernández',
    institute: 'Escuela de Geografía',
    discipline: 'Gestión del Riesgo',
    researchType: 'Básica',
    projectType: 'Iniciativa',
    fundingType: 'Fondos Externos',
    status: 'Activo',
    startDate: '2025-07-01',
    endDate: '2027-06-30',
    keywords: ['Inundaciones', 'Cartografía', 'Riesgo', 'Participación comunitaria'],
    associatedProfiles: [
      { id: 'r31', name: 'Raúl Ávila Hernández', role: 'Investigador principal' },
      { id: 'r32', name: 'Valeria Marín Cerdas' },
    ],
  },
  {
    id: '18',
    code: 'C7745',
    title:
      'Acción territorial para fortalecimiento de emprendimientos turísticos culturales en zonas costeras.',
    description:
      'Acompañamiento a colectivos locales para diseñar rutas, productos y estrategias de comercialización con enfoque de sostenibilidad cultural.',
    manager: 'Irene Chacón Villalta',
    institute: 'Escuela de Administración Pública',
    discipline: 'Gestión Territorial',
    researchType: 'Aplicada',
    projectType: 'Acción',
    fundingType: 'CONARE',
    status: 'Vencido',
    startDate: '2022-04-01',
    endDate: '2024-03-31',
    keywords: ['Turismo', 'Cultura', 'Emprendimiento', 'Territorio'],
    associatedProfiles: [
      { id: 'r33', name: 'Irene Chacón Villalta', role: 'Coordinadora' },
      { id: 'r34', name: 'José Alvarado Rivas' },
    ],
  },
];

// =========================
// FILTERS
// =========================

export const MOCK_PROJECT_FILTERS: ProjectFilters = {
  researchType: [
    { label: 'Básica', count: 7, value: 'basica' },
    { label: 'Aplicada', count: 7, value: 'aplicada' },
    { label: 'Exploratoria', count: 2, value: 'exploratoria' },
    { label: 'Desarrollo', count: 2, value: 'desarrollo' },
  ],

  projectType: [
    { label: 'Proyecto', count: 13, value: 'proyecto' },
    { label: 'Acción', count: 2, value: 'accion' },
    { label: 'Programa', count: 2, value: 'programa' },
    { label: 'Iniciativa', count: 2, value: 'iniciativa' },
  ],

  startYear: [
    { label: '2026', count: 2, value: '2026' },
    { label: '2025', count: 3, value: '2025' },
    { label: '2024', count: 5, value: '2024' },
    { label: '2023', count: 4, value: '2023' },
    { label: '2022', count: 2, value: '2022' },
  ],

  status: [
    { label: 'Activo', count: 9, value: 'activo' },
    { label: 'Finalizado', count: 5, value: 'finalizado' },
    { label: 'Vencido', count: 2, value: 'vencido' },
    { label: 'No iniciado', count: 2, value: 'no-iniciado' },
  ],

  participants: [
    { label: 'Koen Voorend', count: 1, value: 'koen-voorend' },
    { label: 'Shu Wei Chou Chen', count: 1, value: 'shu-wei-chou-chen' },
    { label: 'Alejandra Arias Salazar', count: 1, value: 'alejandra-arias-salazar' },
    {
      label: 'Shirley Elena Rojas Salazar',
      count: 1,
      value: 'shirley-elena-rojas-salazar',
    },
    { label: 'Daniela Vargas Mora', count: 1, value: 'daniela-vargas-mora' },
    { label: 'Carlos Andrés Quesada', count: 1, value: 'carlos-andres-quesada' },
    { label: 'Melissa Porras Rojas', count: 1, value: 'melissa-porras-rojas' },
    { label: 'Esteban Calderón Umaña', count: 1, value: 'esteban-calderon-umana' },
    { label: 'Nadia Villalobos Chacón', count: 1, value: 'nadia-villalobos-chacon' },
    { label: 'Karla Montero León', count: 1, value: 'karla-montero-leon' },
    { label: 'Paula Jiménez Araya', count: 1, value: 'paula-jimenez-araya' },
    { label: 'Jorge Alberto Ureña', count: 1, value: 'jorge-alberto-urena' },
    { label: 'Fernando Salas Núñez', count: 1, value: 'fernando-salas-nunez' },
    { label: 'Andrea Coto Ramírez', count: 1, value: 'andrea-coto-ramirez' },
    { label: 'Raúl Ávila Hernández', count: 1, value: 'raul-avila-hernandez' },
    { label: 'Mauricio Zúñiga Solano', count: 1, value: 'mauricio-zuniga-solano' },
    { label: 'Lucía Varela Campos', count: 1, value: 'lucia-varela-campos' },
    { label: 'Irene Chacón Villalta', count: 1, value: 'irene-chacon-villalta' },
  ],

  keywords: [
    { label: 'Pobreza', count: 2, value: 'pobreza' },
    { label: 'Salud', count: 2, value: 'salud' },
    { label: 'Educación', count: 2, value: 'educacion' },
    { label: 'Sostenibilidad', count: 2, value: 'sostenibilidad' },
    { label: 'Datos abiertos', count: 1, value: 'datos-abiertos' },
    { label: 'Interoperabilidad', count: 1, value: 'interoperabilidad' },
    { label: 'Agricultura', count: 1, value: 'agricultura' },
    { label: 'Turismo', count: 1, value: 'turismo' },
  ],
};

// =========================
// HELPERS
// =========================

export function getMockProjectById(id: string): Project | undefined {
  return MOCK_PROJECTS.find((project) => project.id === id);
}

export function getMockProjectsPaginated(
  page = 1,
  limit = 10,
  searchQuery = '',
  queryFilters: ProjectQueryFilters = {},
): PaginatedProjects {
  const normalize = (value: string): string =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const hasSelection = (values?: string[]): values is string[] =>
    Array.isArray(values) && values.length > 0;

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const textFilteredProjects = normalizedQuery
    ? MOCK_PROJECTS.filter((project) => {
        const searchableText = [
          project.code,
          project.title,
          project.description,
          project.manager,
          project.institute,
          project.discipline,
          project.researchType,
          project.projectType,
          project.fundingType,
          project.status,
          project.keywords.join(' '),
          project.associatedProfiles.map((profile) => profile.name).join(' '),
        ]
          .join(' ')
          .toLowerCase();

        return searchableText.includes(normalizedQuery);
      })
    : MOCK_PROJECTS;

  const filteredProjects = textFilteredProjects.filter((project) => {
    if (
      hasSelection(queryFilters.researchType) &&
      !queryFilters.researchType.includes(normalize(project.researchType))
    ) {
      return false;
    }

    if (
      hasSelection(queryFilters.projectType) &&
      !queryFilters.projectType.includes(normalize(project.projectType))
    ) {
      return false;
    }

    if (
      hasSelection(queryFilters.startYear) &&
      !queryFilters.startYear.includes(project.startDate.slice(0, 4))
    ) {
      return false;
    }

    if (
      hasSelection(queryFilters.status) &&
      !queryFilters.status.includes(normalize(project.status))
    ) {
      return false;
    }

    if (hasSelection(queryFilters.participants)) {
      const participantSlugs = project.associatedProfiles.map((profile) =>
        normalize(profile.name),
      );

      const hasParticipant = queryFilters.participants.some((slug) =>
        participantSlugs.includes(slug),
      );

      if (!hasParticipant) {
        return false;
      }
    }

    if (hasSelection(queryFilters.keywords)) {
      const keywordSlugs = project.keywords.map((keyword) => normalize(keyword));

      const hasKeyword = queryFilters.keywords.some((slug) =>
        keywordSlugs.includes(slug),
      );

      if (!hasKeyword) {
        return false;
      }
    }

    return true;
  });

  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    data: filteredProjects.slice(start, end),
    total: filteredProjects.length,
    page,
    limit,
  };
}

export function getMockProjectFilters(): ProjectFilters {
  return MOCK_PROJECT_FILTERS;
}
