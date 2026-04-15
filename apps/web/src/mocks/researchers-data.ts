// =========================
// MOCK RESEARCHERS DATA
// =========================

export interface Researcher {
  id: string;
  idUcrProfile: string;
  baseUnit: string;
  name: string;
  firstSurname: string;
  secondSurname: string;
  ceaCategory: string | null;
  orcidId: string | null;
  linkedin: string | null;
  researchGate: string | null;
  scopus: string | null;
  photoUrl: string | null;
}

export interface FilterOption {
  label: string;
  count: number;
  value: string;
}

export interface ResearcherFilters {
  baseUnit: FilterOption[];
  ceaCategory: FilterOption[];
}

export interface PaginatedResearchers {
  data: Researcher[];
  total: number;
  page: number;
  limit: number;
}

export interface ResearcherQueryFilters {
  baseUnit?: string[];
  ceaCategory?: string[];
}

export const MOCK_RESEARCHERS: Researcher[] = [
  {
    id: '1',
    idUcrProfile: 'alejandra-arias',
    baseUnit: 'Escuela de Ingeniería Eléctrica',
    name: 'Alejandra',
    firstSurname: 'Arias',
    secondSurname: 'Salazar',
    ceaCategory: 'Categoría I',
    orcidId: '0000-0008-7598-5728',
    linkedin: 'https://www.linkedin.com/in/alejandra',
    researchGate: 'https://www.researchgate.net/profile/alejandra',
    scopus: null,
    photoUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    id: '2',
    idUcrProfile: 'juan-perez',
    baseUnit: 'Escuela de Ciencias de la Ingeniería',
    name: 'Juan',
    firstSurname: 'Pérez',
    secondSurname: 'González',
    ceaCategory: 'Categoría II',
    orcidId: '0000-0001-2345-6789',
    linkedin: null,
    researchGate: null,
    scopus: null,
    photoUrl: null,
  },
  {
    id: '3',
    idUcrProfile: 'maria-fernandez',
    baseUnit: 'Escuela de Ciencias Sociales y Humanidades',
    name: 'María',
    firstSurname: 'Fernández',
    secondSurname: 'López',
    ceaCategory: 'Categoría III',
    orcidId: null,
    linkedin: null,
    researchGate: null,
    scopus: null,
    photoUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  {
    id: '4',
    idUcrProfile: 'carlos-rodriguez',
    baseUnit: 'Escuela de Ciencias y Tecnología',
    name: 'Carlos',
    firstSurname: 'Rodríguez',
    secondSurname: 'Martínez',
    ceaCategory: 'Categoría I',
    orcidId: '0000-0003-4567-8901',
    linkedin: null,
    researchGate: null,
    scopus: null,
    photoUrl: null,
  },
  {
    id: '5',
    idUcrProfile: 'ana-garcia',
    baseUnit: 'Centro de Biología Celular',
    name: 'Ana',
    firstSurname: 'García',
    secondSurname: 'Flores',
    ceaCategory: 'Categoría II',
    orcidId: null,
    linkedin: null,
    researchGate: null,
    scopus: null,
    photoUrl: 'https://randomuser.me/api/portraits/women/3.jpg',
  },
  {
    id: '6',
    idUcrProfile: 'luis-sanchez',
    baseUnit: 'Escuela de Ingeniería Eléctrica',
    name: 'Luis',
    firstSurname: 'Sánchez',
    secondSurname: 'Ruiz',
    ceaCategory: 'Categoría IV',
    orcidId: null,
    linkedin: null,
    researchGate: null,
    scopus: null,
    photoUrl: null,
  },
  {
    id: '7',
    idUcrProfile: 'rosa-torres',
    baseUnit: 'Escuela de Ciencias Sociales y Humanidades',
    name: 'Rosa',
    firstSurname: 'Torres',
    secondSurname: 'Castro',
    ceaCategory: 'Asesor',
    orcidId: null,
    linkedin: null,
    researchGate: null,
    scopus: null,
    photoUrl: 'https://randomuser.me/api/portraits/women/4.jpg',
  },
  {
    id: '8',
    idUcrProfile: 'diego-morales',
    baseUnit: 'Escuela de Ciencias de la Ingeniería',
    name: 'Diego',
    firstSurname: 'Morales',
    secondSurname: 'Díaz',
    ceaCategory: 'Categoría I',
    orcidId: null,
    linkedin: null,
    researchGate: null,
    scopus: null,
    photoUrl: null,
  },
  {
    id: '9',
    idUcrProfile: 'sofia-mendez',
    baseUnit: 'Centro de Biología Celular',
    name: 'Sofía',
    firstSurname: 'Méndez',
    secondSurname: 'Vargas',
    ceaCategory: 'Categoría III',
    orcidId: null,
    linkedin: null,
    researchGate: null,
    scopus: null,
    photoUrl: 'https://randomuser.me/api/portraits/women/5.jpg',
  },
  {
    id: '10',
    idUcrProfile: 'pablo-jimenez',
    baseUnit: 'Escuela de Ciencias y Tecnología',
    name: 'Pablo',
    firstSurname: 'Jiménez',
    secondSurname: 'Herrera',
    ceaCategory: 'Categoría II',
    orcidId: null,
    linkedin: null,
    researchGate: null,
    scopus: null,
    photoUrl: null,
  },
  {
    id: '11',
    idUcrProfile: 'teresa-nunez',
    baseUnit: 'Escuela de Ingeniería Eléctrica',
    name: 'Teresa',
    firstSurname: 'Núñez',
    secondSurname: 'Ortega',
    ceaCategory: 'Categoría IV',
    orcidId: null,
    linkedin: null,
    researchGate: null,
    scopus: null,
    photoUrl: 'https://randomuser.me/api/portraits/women/6.jpg',
  },
  {
    id: '12',
    idUcrProfile: 'javier-molina',
    baseUnit: 'Escuela de Ciencias Sociales y Humanidades',
    name: 'Javier',
    firstSurname: 'Molina',
    secondSurname: 'Peña',
    ceaCategory: 'Categoría I',
    orcidId: null,
    linkedin: null,
    researchGate: null,
    scopus: null,
    photoUrl: null,
  },
];

export function getMockResearchersPaginated(
  page = 1,
  limit = 9,
  searchQuery = '',
  queryFilters: ResearcherQueryFilters = {},
): PaginatedResearchers {
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

  const textFilteredResearchers = normalizedQuery
    ? MOCK_RESEARCHERS.filter((researcher) => {
        const searchableText = [
          researcher.name,
          researcher.firstSurname,
          researcher.secondSurname,
          researcher.baseUnit,
          researcher.ceaCategory || '',
        ]
          .join(' ')
          .toLowerCase();

        return searchableText.includes(normalizedQuery);
      })
    : MOCK_RESEARCHERS;

  const filteredResearchers = textFilteredResearchers.filter((researcher) => {
    if (
      hasSelection(queryFilters.baseUnit) &&
      !queryFilters.baseUnit.includes(normalize(researcher.baseUnit))
    ) {
      return false;
    }

    if (
      hasSelection(queryFilters.ceaCategory) &&
      !queryFilters.ceaCategory.includes(normalize(researcher.ceaCategory || ''))
    ) {
      return false;
    }

    return true;
  });

  const total = filteredResearchers.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = filteredResearchers.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    total,
    page,
    limit,
  };
}

export function getMockResearcherFilters(): ResearcherFilters {
  const baseUnitCounts: Record<string, number> = {};
  const ceaCategoryCounts: Record<string, number> = {};

  MOCK_RESEARCHERS.forEach((researcher) => {
    const baseUnitKey = researcher.baseUnit;
    baseUnitCounts[baseUnitKey] = (baseUnitCounts[baseUnitKey] || 0) + 1;

    const ceaCategoryKey = researcher.ceaCategory || 'Sin categoría';
    ceaCategoryCounts[ceaCategoryKey] = (ceaCategoryCounts[ceaCategoryKey] || 0) + 1;
  });

  return {
    baseUnit: Object.entries(baseUnitCounts).map(([label, count]) => ({
      label,
      count,
      value: label
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''),
    })),
    ceaCategory: Object.entries(ceaCategoryCounts).map(([label, count]) => ({
      label,
      count,
      value: label
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''),
    })),
  };
}
