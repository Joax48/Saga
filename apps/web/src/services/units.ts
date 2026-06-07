import { request } from './api';

/**
 * Unit summary from the public units API list endpoint.
 */
export interface Unit {
  id: number;
  name: string;
  logoSvgContent: string | null;
  logoUnitAcronym: string | null;
}

/**
 * Generic paginated response contract used by the BFF list endpoints.
 */
interface PaginatedListResponseDto<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

/**
 * Paginated Units response for frontend.
 */
export interface PaginatedUnitsResponse {
  data: Unit[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Filters for fetching units. Currently only supports filtering by researchedIds, but can be extended in the future with additional filters and sorting options.
 */
export interface GetUnitsFilters {
  researcherIds?: number[];
  researcherBaseUnitIds?: number[];

  sortBy?: 'name';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Fetches a paginated list of units from the backend.
 *
 * Search parameters are currently accepted for API compatibility,
 * but they are not yet used by the active backend endpoint.
 */
export function getUnits(
  page = 1,
  limit = 9,
  searchQuery = '',
  filters: GetUnitsFilters = {},
): Promise<PaginatedUnitsResponse> {
  const params = new URLSearchParams();

  params.append('page', String(page));
  params.append('limit', String(limit));

  if (searchQuery.trim()) {
    params.append('q', searchQuery.trim());
  }

  filters.researcherIds?.forEach((id) => {
    params.append('researcherIds', String(id));
  });

  filters.researcherBaseUnitIds?.forEach((id) => {
    params.append('researcherBaseUnitIds', String(id));
  });

  if (filters.sortBy) {
    params.append('sortBy', filters.sortBy);
  }

  if (filters.sortOrder) {
    params.append('sortOrder', filters.sortOrder);
  }

  return request<PaginatedListResponseDto<Unit>>(`/units?${params.toString()}`).then(
    (response) => ({
      data: response.items,
      page: response.page,
      limit: response.limit,
      total: response.total,
    }),
  );
}

/**
 * Unit detail returned by GET /units/:id.
 */
export interface UnitDetail {
  id: number;
  name: string;
  description: string;
  email: string;
  pageUrl: string;
  phoneNumber: string;
}

export interface UnitProfile {
  id: number;
  baseUnit: string | null;
  name: string;
  ceaCategory: string | null;
  photoUrl: string | null;
}

export function getUnitById(id: number): Promise<UnitDetail> {
  return request<UnitDetail>(`/units/${id}`);
}

/**
 * Option returned by the GET /units/filters endpoint.
 */
export interface UnitFilterOption {
  label: string;
  value: string;
  count: number;
}

/**
 * Response shape of GET /units/filters.
 */
export interface UnitFiltersResponse {
  researchers: UnitFilterOption[];
  researchersByBaseUnit: UnitFilterOption[];
}

/**
 * Fetches filter options for the units listing (researcher names derived from the units data).
 */
export function getUnitFilters(q?: string): Promise<UnitFiltersResponse> {
  const params = new URLSearchParams();
  if (q?.trim()) {
    params.append('q', q.trim());
  }
  const qs = params.toString();
  return request<UnitFiltersResponse>(`/units/filters${qs ? `?${qs}` : ''}`);
}

export function getUnitProfiles(id: number): Promise<UnitProfile[]> {
  return request<UnitProfile[]>(`/units/${id}/profiles`);
}

export interface UnitScientificProduction {
  id: string;
  title: string;
  authors: string;
  type: string;
  publicationYear: number;
  doi: string | null;
  journal: string | null;
  volume: number | null;
  issue: number | null;
  pages: string | null;
  keywords: string;
}

export function getUnitScientificProductions(
  id: number,
): Promise<UnitScientificProduction[]> {
  return request<UnitScientificProduction[]>(`/units/${id}/scientific-productions`);
}

export interface UnitProject {
  id: string;
  code: string;
  name: string;
  managerName: string;
  managerId: number;
  startDate: string;
  endDate: string;
  researchType: string;
  projectType: string;
  keywords: string | null;
}

export function getUnitProjects(id: number): Promise<UnitProject[]> {
  return request<UnitProject[]>(`/units/${id}/projects`);
}
