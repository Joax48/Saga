import { request } from './api';

import {
  Researcher,
  PaginatedResearchers,
} from '@/types/researcher-data';

/**
 * Researcher summary shape returned by the public researchers API list endpoint.
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
 * Maps an API researcher into the UI researcher model.
 */
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
 * Fetches a paginated list of researchers from the backend.
 */
export function getResearchers(
  page = 1,
  limit = 9,
  searchQuery = '',
): Promise<PaginatedResearchers> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (searchQuery) params.set('name', searchQuery);
  return request<PaginatedListResponseDto<ResearcherSummaryApiDto>>(
    `/researchers?${params.toString()}`,
  ).then((response) => ({
    data: response.items.map(mapResearcherSummaryToResearcher),
    page: response.page,
    limit: response.limit,
    total: response.total,
  }));
}

/**
 * Fetches a researcher by id from mock data.

export function getResearcherById(id: string): Promise<Researcher> {
  const researcher = MOCK_RESEARCHERS.find((item) => item.id === id);
  if (!researcher) {
    return Promise.reject(new Error('Researcher not found'));
  }
  return Promise.resolve(researcher);
} 
*/

/**
 * Basic researchers service template.
 
export function getResearchers(page = 1, limit = 10) {
  return request(`/researchers?page=${page}&limit=${limit}`);
}

export function getResearcherById(id: string) {
  return request(`/researchers/${id}`);
}
*/
