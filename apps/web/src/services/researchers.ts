import {
  getMockResearchersPaginated,
  getMockResearcherFilters,
  MOCK_RESEARCHERS,
} from '@/mocks/researchers-data';

import type {
  PaginatedResearchers,
  ResearcherFilters,
  ResearcherQueryFilters,
} from '@/mocks/researchers-data';
import type { Researcher } from '@/types/researcher-data';

export type { PaginatedResearchers, ResearcherFilters, ResearcherQueryFilters };
export type { Researcher } from '@/types/researcher-data';

/**
 * Fetches a paginated list of researchers from mock data.
 */
export function getResearchers(
  page = 1,
  limit = 9,
  searchQuery = '',
  queryFilters: ResearcherQueryFilters = {},
): Promise<PaginatedResearchers> {
  return Promise.resolve(
    getMockResearchersPaginated(page, limit, searchQuery, queryFilters),
  );
}

/**
 * Fetches a researcher by id from mock data.
 */
export function getResearcherById(id: string) {
  const researcher = MOCK_RESEARCHERS.find((item) => item.id === id);
  if (!researcher) {
    return Promise.reject(new Error('Researcher not found'));
  }
  return Promise.resolve(researcher);
}

/**
 * Fetches filter options for researchers.
 */
export function getResearcherFilters(): Promise<ResearcherFilters> {
  return Promise.resolve(getMockResearcherFilters());
}
