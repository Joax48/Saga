/**
 * Mock data for units - used for development without database access
 */

export interface MockUnit {
  id: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  researchers: Array<{
    id: string;
    name: string;
    description: string;
    profile: string;
  }>;
  projects: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  scientificProductions: Array<{
    id: string;
    title: string;
    description: string;
  }>;
}

export interface PaginatedUnits {
  data: MockUnit[];
  total: number;
  page: number;
  limit: number;
}

export const MOCK_UNITS: MockUnit[] = [
  {
    id: '1',
    name: 'Escuela de Física',
    description:
      'Investigación de vanguardia en física teórica y experimental, incluyendo mecánica cuántica, física de partículas y astrofísica. Nuestro personal académico y estudiantes contribuyen a la comprensión de fenómenos fundamentales a través de proyectos de investigación de punta. Mantenemos colaboraciones activas con instituciones de investigación internacionales y proporcionamos capacitación integral en metodologías avanzadas de física. Nuestros laboratorios están equipados con instrumentación de última generación para realizar experimentos innovadores en diversos dominios de la física.',
    email: 'physics@ucr.ac.cr',
    phone: '+506 2511-0000',
    address: 'San Pedro, San José, Costa Rica',
    website: 'https://www.ucr.ac.cr',
    researchers: [
      {
        id: 'r1',
        name: 'Dr. Carlos Ramírez',
        description:
          'Especialista en computación cuántica y mecánica cuántica con más de 15 años de experiencia.',
        profile: 'Experto en Computación Cuántica',
      },
      {
        id: 'r2',
        name: 'Dr. María González',
        description:
          'Investigador enfocado en física de partículas y experimentos de física de alta energía.',
        profile: 'Investigador de Física de Partículas',
      },
      {
        id: 'r3',
        name: 'Dr. Juan López',
        description:
          'Experto en astrofísica y cosmología, estudiando materia oscura y energía oscura.',
        profile: 'Astrofísico',
      },
    ],
    projects: [
      {
        id: 'p1',
        title: 'Aplicaciones de Computación Cuántica en Costa Rica',
        description:
          'Desarrollando soluciones prácticas de computación cuántica para industrias locales.',
      },
      {
        id: 'p2',
        title: 'Análisis de Datos de Física de Alta Energía',
        description:
          'Analizando datos de experimentos de acelerador de partículas para descubrir nuevas partículas.',
      },
    ],
    scientificProductions: [
      {
        id: 'sp1',
        title: 'Nuevo Enfoque en Corrección de Errores Cuánticos',
        description:
          'Publicado en Nature Physics, 2024. Un avance en técnicas de corrección de errores cuánticos.',
      },
      {
        id: 'sp2',
        title: 'Evidencia Observacional de Interacciones de Materia Oscura',
        description:
          'Artículo de investigación publicado en The Astrophysical Journal, 2023.',
      },
    ],
  },
  {
    id: '2',
    name: 'Escuela de Biología',
    description:
      'Avanzando la investigación biológica a través de biología molecular, genética, ecología y estudios de conservación. Nos enfocamos en comprender la complejidad de los organismos vivos y sus interacciones con el ambiente. Nuestros programas de investigación abarcan investigaciones teóricas y aplicaciones prácticas para abordar desafíos biológicos contemporáneos. La escuela promueve colaboración interdisciplinaria y mantiene asociaciones con centros de investigación líderes en todo el mundo.',
    email: 'biology@ucr.ac.cr',
    phone: '+506 2511-1111',
    address: 'San Pedro, San José, Costa Rica',
    website: 'https://www.ucr.ac.cr',
    researchers: [
      {
        id: 'r4',
        name: 'Dra. Ana Martínez',
        description:
          'Bióloga molecular especializada en expresión génica y terapia génica.',
        profile: 'Bióloga Molecular',
      },
      {
        id: 'r5',
        name: 'Dr. Roberto Silva',
        description:
          'Ecólogo enfocado en biodiversidad tropical y esfuerzos de conservación en América Central.',
        profile: 'Ecólogo de Conservación',
      },
    ],
    projects: [
      {
        id: 'p3',
        title: 'Biodiversidad Genética de Bosques Lluviosos Costarricenses',
        description:
          'Catalogando y analizando la diversidad genética de especies en ecosistemas tropicales.',
      },
      {
        id: 'p4',
        title: 'Terapia Génica para Enfermedades Hereditarias',
        description:
          'Desarrollando tratamientos innovadores de terapia génica para trastornos genéticos.',
      },
    ],
    scientificProductions: [
      {
        id: 'sp3',
        title: 'Puntos Críticos de Biodiversidad en Bosques Lluviosos Centroamericanos',
        description: 'Estudio integral publicado en Biological Conservation, 2024.',
      },
    ],
  },
  {
    id: '3',
    name: 'Escuela de Química',
    description:
      'Innovación en química orgánica, bioquímica, ciencia de materiales y química ambiental. Realizamos investigación avanzada para desarrollar procesos químicos sostenibles y materiales novedosos para aplicaciones industriales. Nuestra escuela enfatiza principios de química verde y promueve metodologías de investigación ambientalmente responsables. A través de colaboración con socios de industria y universidades, traducimos descubrimientos en soluciones prácticas.',
    email: 'chemistry@ucr.ac.cr',
    phone: '+506 2511-2222',
    address: 'San Pedro, San José, Costa Rica',
    website: 'https://www.ucr.ac.cr',
    researchers: [
      {
        id: 'r6',
        name: 'Dr. Fernando Delgado',
        description:
          'Químico orgánico desarrollando nuevos métodos de síntesis sostenible y química verde.',
        profile: 'Químico Orgánico',
      },
      {
        id: 'r7',
        name: 'Dra. Lucía Fernández',
        description:
          'Bioquímica investigando el plegamiento de proteínas y cinética enzimática para aplicaciones médicas.',
        profile: 'Bioquímica',
      },
    ],
    projects: [
      {
        id: 'p5',
        title: 'Métodos de Síntesis Química Sostenible',
        description:
          'Desarrollando rutas de síntesis amigables con el ambiente para compuestos farmacéuticos.',
      },
      {
        id: 'p6',
        title: 'Biomateriales Novedosos de Polímeros Naturales',
        description:
          'Creando materiales biodegradables a partir de fuentes naturales para uso médico e industrial.',
      },
    ],
    scientificProductions: [
      {
        id: 'sp4',
        title: 'Enfoques de Química Verde en Fabricación Farmacéutica',
        description:
          'Impacto de métodos sostenibles publicado en ACS Sustainable Chemistry & Engineering.',
      },
      {
        id: 'sp5',
        title: 'Ingeniería de Proteínas para Catálisis Enzimática Mejorada',
        description:
          'Publicación en Journal of Biological Chemistry sobre actividad de proteína ingenierizada.',
      },
    ],
  },
  {
    id: '4',
    name: 'Escuela de Ciencias de la Computación',
    description:
      'Innovación en inteligencia artificial, aprendizaje automático, ingeniería de software y ciberseguridad. Nuestro departamento está en la vanguardia del desarrollo de sistemas inteligentes y soluciones de computación segura. Realizamos investigación que abarca desde el desarrollo de algoritmos fundamentales hasta aplicaciones prácticas en escenarios del mundo real. Nuestro personal académico y estudiantes trabajan en proyectos que expanden los límites de la ciencia computacional.',
    email: 'cs@ucr.ac.cr',
    phone: '+506 2511-3333',
    address: 'San Pedro, San José, Costa Rica',
    website: 'https://www.ucr.ac.cr',
    researchers: [
      {
        id: 'r8',
        name: 'Dr. Miguel Torres',
        description:
          'Investigador de IA especializado en procesamiento de lenguaje natural y arquitecturas de aprendizaje profundo.',
        profile: 'Investigador de IA',
      },
      {
        id: 'r9',
        name: 'Dra. Patricia Morales',
        description:
          'Experta en ciberseguridad desarrollando sistemas avanzados de detección y prevención de amenazas.',
        profile: 'Especialista en Ciberseguridad',
      },
    ],
    projects: [
      {
        id: 'p7',
        title: 'Procesamiento de Lenguaje Natural para Texto en Español',
        description:
          'Modelos avanzados de PLN optimizados para comprensión y generación de lenguaje español.',
      },
      {
        id: 'p8',
        title: 'Sistema de Defensa de Ciberseguridad Basado en IA',
        description:
          'Sistema basado en aprendizaje automático para detectar y prevenir ataques cibernéticos en tiempo real.',
      },
    ],
    scientificProductions: [
      {
        id: 'sp6',
        title: 'Modelos de Lenguaje Multilingües para Idiomas de Bajo Recurso',
        description: 'Publicado en Proceedings of ACL Conference 2024.',
      },
      {
        id: 'sp7',
        title: 'Aprendizaje Automático Adversarial para Mejora de Robustez',
        description:
          'Publicación en IEEE Transactions on Information Forensics and Security.',
      },
    ],
  },
];

/**
 * Helper function to get a unit by ID
 */
export function getMockUnitById(id: string): MockUnit | undefined {
  return MOCK_UNITS.find((unit) => unit.id === id);
}

/**
 * Helper function to get paginated units with optional search filter
 */
export function getMockUnitsPaginated(
  page: number = 1,
  limit: number = 9,
  searchQuery: string = '',
): PaginatedUnits {
  const filtered = searchQuery
    ? MOCK_UNITS.filter((unit) =>
        unit.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : MOCK_UNITS;

  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    data: filtered.slice(start, end),
    total: filtered.length,
    page,
    limit,
  };
}
