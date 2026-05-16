import { request } from './api';

import type { Researcher } from '@/types/researcher-data';

import type {
  PaginatedResearchers,
  ResearcherFilters,
  ResearcherQueryFilters,
} from '@/types/researcher-data';

export type { PaginatedResearchers, ResearcherFilters, ResearcherQueryFilters };
export type { Researcher } from '@/types/researcher-data';

/**
 * Shape of the researcher returned by the backend API.
 * Matches ResearcherSummaryResponseDto from the BFF.
 */
interface ResearcherSummaryApiDto {
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

/** Generic paginated response shape from the BFF */
interface PaginatedListResponseDto<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

/** Transforms the API DTO into the UI model */
function mapResearcherSummaryToResearcher(item: ResearcherSummaryApiDto): Researcher {
  return {
    id: item.id,
    idUcrProfile: item.idUcrProfile,
    baseUnit: item.baseUnit,
    name: item.name,
    firstSurname: item.firstSurname,
    secondSurname: item.secondSurname,
    ceaCategory: item.ceaCategory,
    orcidId: item.orcidId,
    linkedin: item.linkedin,
    researchGate: item.researchGate,
    scopus: item.scopus,
    photoUrl: item.photoUrl,
  };
}

/**
 * Fetches a page of researchers from the backend.
 * Builds query params for text search and unit filter.
 * The "unit" param can repeat (unit=X&unit=Y) for multi-select filters.
 */
export function getResearchers(
  page = 1,
  limit = 9,
  searchQuery = '',
  units?: string[],
): Promise<PaginatedResearchers> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });

  if (searchQuery) params.set('q', searchQuery);

  if (units && units.length > 0) {
    units.forEach((unit) => params.append('unit', unit));
  }

  return request<PaginatedListResponseDto<ResearcherSummaryApiDto>>(
    `/researchers?${params.toString()}`,
  ).then((response) => ({
    data: response.items.map(mapResearcherSummaryToResearcher),
    page: response.page,
    limit: response.limit,
    total: response.total,
  }));
}

/** Fetches a single researcher by ID */
export function getResearcherById(id: string): Promise<Researcher> {
  return request<ResearcherSummaryApiDto>(`/researchers/${id}`).then(
    mapResearcherSummaryToResearcher,
  );
}

/**
 * Fetches the unit filter options with their researcher counts.
 *
 * Before: the API returned string[] and the frontend set count: 0 for all options.
 * Now: the API returns { value, count }[] with real counts from Oracle,
 *      calculated using GROUP BY + COUNT(DISTINCT) in the database.
 *      This allows the sidebar to display how many researchers belong to each unit.
 */
export async function getResearcherFilters(): Promise<ResearcherFilters> {
  // The backend now returns objects with value and count, not plain strings
  const response = await request<{ baseUnit: Array<{ value: string; count: number }> }>(
    `/researchers/filters`,
  );

  return {
    baseUnit: response.baseUnit.map(({ value, count }) => ({
      value,
      label: value, // the visible label is the unit name itself
      count, // real number of researchers in that unit
    })),
  };
}
