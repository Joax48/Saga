import { request } from './api';

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

export interface PaginatedProjects {
  data: Project[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Project summary shape returned by the public projects API list endpoint.
 */
interface ProjectSummaryApiDto {
  code: string;
  name: string;
  projectType?: string;
  researchType: string;
  startDate: string;
  endDate: string;
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
 * Maps a lightweight API project summary into the richer UI project model.
 *
 * Some fields are intentionally filled with placeholder values because
 * the list endpoint does not provide full project detail yet.
 */
function mapProjectSummaryToProject(item: ProjectSummaryApiDto): Project {
  return {
    id: item.code,
    code: item.code,
    title: item.name,
    description: '',
    manager: 'No disponible',
    institute: 'No disponible',
    discipline: 'No disponible',
    researchType: item.researchType,
    projectType: item.projectType ?? 'No disponible',
    fundingType: 'No disponible',
    status: 'No disponible',
    startDate: item.startDate,
    endDate: item.endDate,
    keywords: [],
    associatedProfiles: [],
  };
}

/**
 * Fetches a paginated list of projects from the backend.
 *
 * When a search query is provided, this uses the backend search endpoint.
 */
export function getProjects(
  page = 1,
  limit = 10,
  searchQuery = '',
): Promise<PaginatedProjects> {
  const endpoint =
    searchQuery.trim().length > 0
      ? `/projects/search?q=${encodeURIComponent(searchQuery.trim())}&page=${page}&limit=${limit}`
      : `/projects?page=${page}&limit=${limit}`;

  return request<PaginatedListResponseDto<ProjectSummaryApiDto>>(endpoint).then(
    (response) => ({
      data: response.items.map(mapProjectSummaryToProject),
      page: response.page,
      limit: response.limit,
      total: response.total,
    }),
  );
}

/**
 * Explicit search helper for projects.
 *
 * This is useful if a page wants to call the search endpoint directly.
 */
export function searchProjects(
  q: string,
  page = 1,
  limit = 10,
): Promise<PaginatedProjects> {
  return getProjects(page, limit, q);
}
