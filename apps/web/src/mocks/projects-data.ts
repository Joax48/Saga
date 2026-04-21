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

export const PROJECT_DETAIL_EXAMPLE: Project = {
  id: 'example-project',
  code: 'C-EXAMPLE-2026',
  title: 'Proyecto demostrativo de visualizacion del detalle',
  description:
    'Este es un ejemplo estatico para mostrar la estructura completa del detalle del proyecto mientras se integra el endpoint real de detalle.',
  manager: 'Persona Investigadora Ejemplo',
  institute: 'Instituto de Investigacion de Ejemplo',
  discipline: 'Ciencias Aplicadas',
  researchType: 'Aplicada',
  projectType: 'Proyecto',
  fundingType: 'Fondos Institucionales',
  status: 'Activo',
  startDate: '2026-01-01',
  endDate: '2027-12-31',
  keywords: ['Innovacion', 'Investigacion', 'Transferencia'],
  associatedProfiles: [
    {
      id: '101',
      name: 'Persona Investigadora Ejemplo',
      role: 'Persona encargada del proyecto',
    },
    {
      id: '102',
      name: 'Colaborador Academico Ejemplo',
      role: 'Co-investigador',
    },
    {
      id: '103',
      name: 'Asistente de Investigacion Ejemplo',
      role: 'Asistente',
    },
  ],
};

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

export function getMockProjectFilters(): ProjectFilters {
  return MOCK_PROJECT_FILTERS;
}
