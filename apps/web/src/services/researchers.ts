import { request } from './api';

import type { Researcher } from '@/types/researcher-data';
import type { ResearcherProfile } from '@/types/researcher-profile';

import type {
  PaginatedResearchers,
  ResearcherFilters,
  ResearcherQueryFilters,
} from '@/types/researcher-data';

export type { PaginatedResearchers, ResearcherFilters, ResearcherQueryFilters };
export type { Researcher } from '@/types/researcher-data';
export type {
  ResearcherProfile,
  ResearcherAlternativeName,
  ResearcherEducation,
  ResearcherExperience,
  ResearcherLinkedUnit,
  ResearcherProject,
  ResearcherScientificOutput,
} from '@/types/researcher-profile';

/**
 * Shape of the researcher returned by the backend API.
 * Matches ResearcherSummaryResponseDto from the BFF.
 */
interface ResearcherSummaryApiDto {
  id: string;
  idUcrProfile: string | null;
  baseUnit: string;
  name: string;
  firstSurname: string;
  secondSurname: string;
  ceaCategory: string | null;
  institution: string | null;
  country: string | null;
  institutions: { name: string; country: string | null }[];
  orcidId: string | null;
  linkedin: string | null;
  researchGate: string | null;
  scopus: string | null;
  photoUrl: string | null;
  profileType: 'UCR' | 'EXTERNAL';
  linkedUnits: { id: string; name: string }[];
  workUnits: { id: string; name: string }[];
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
    institution: item.institution,
    country: item.country,
    institutions: item.institutions ?? [],
    orcidId: item.orcidId,
    linkedin: item.linkedin,
    researchGate: item.researchGate,
    scopus: item.scopus,
    photoUrl: item.photoUrl,
    profileType: item.profileType,
    linkedUnits: item.linkedUnits ?? [],
    workUnits: item.workUnits ?? [],
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
  profileType?: 'UCR' | 'EXTERNAL',
): Promise<PaginatedResearchers> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });

  if (searchQuery) params.set('q', searchQuery);

  if (units && units.length > 0) {
    units.forEach((unit) => params.append('unit', unit));
  }

  if (profileType) params.set('profileType', profileType);

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
 * Fetches the full researcher profile: basic info + keywords, education,
 * experience, linked units, projects and scientific outputs. Each section is
 * resolved server-side from the corresponding tables in PRODUCCION_CIENTIFICA
 * for the requested researcher only.
 */
export function getResearcherProfile(id: string): Promise<ResearcherProfile> {
  return request<ResearcherProfile>(`/researchers/${id}/profile`);
}

/**
 * Fetches the unit filter options with their researcher counts.
 *
 * The counts are recalculated server-side based on the active search query
 * and the rest of the applied filters, so the sidebar always reflects how
 * many researchers each option would actually return.
 *
 * The `unit` filter is intentionally still sent: the backend excludes it from
 * the WHERE clause when counting the unit facet, so the other unit options do
 * NOT zero out after the user picks one — they show the count they *would*
 * have if the user switched selection.
 */
export async function getResearcherFilters(
  searchQuery = '',
  units?: string[],
): Promise<ResearcherFilters> {
  const params = new URLSearchParams();
  if (searchQuery) params.set('q', searchQuery);
  if (units && units.length > 0) {
    units.forEach((unit) => params.append('unit', unit));
  }
  const qs = params.toString();

  const response = await request<{ baseUnit: Array<{ value: string; count: number }> }>(
    `/researchers/filters${qs ? `?${qs}` : ''}`,
  );

  return {
    baseUnit: response.baseUnit.map(({ value, count }) => ({
      value,
      label: value, // the visible label is the unit name itself
      count, // real number of researchers given the current search/filters
    })),
  };
}
