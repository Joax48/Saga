import { request } from './api';

import {
  MOCK_PROJECTS,
  getMockProjectById,
  getMockProjectFilters,
  type Project,
  type PaginatedProjects,
  type ProjectFilters,
  type ProjectQueryFilters,
} from '@/mocks/projects-data';

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
  _queryFilters: ProjectQueryFilters = {},
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
  return getProjects(page, limit, q, {});
}

/**
 * Fetches a project by id/code from local mock data.
 *
 * This is a temporary fallback until the project detail endpoint is available.
 */
export function getProjectById(id: string): Promise<Project> {
  const project =
    getMockProjectById(id) || MOCK_PROJECTS.find((item) => item.code === id);

  if (!project) {
    return Promise.reject(new Error('Project not found'));
  }

  return Promise.resolve(project);
}

/**
 * Returns filter options from mock data for the projects page sidebar.
 */
export function getProjectFilters(): Promise<ProjectFilters> {
  return Promise.resolve(getMockProjectFilters());
}
