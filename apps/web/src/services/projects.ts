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
 * Search and filter parameters are currently accepted for API compatibility,
 * but they are not yet used by the active backend endpoint.
 */
export function getProjects(
  page = 1,
  limit = 10,
  _searchQuery = '',
  _queryFilters: ProjectQueryFilters = {},
): Promise<PaginatedProjects> {
  return request<PaginatedListResponseDto<ProjectSummaryApiDto>>(
    `/projects?page=${page}&limit=${limit}`,
  ).then((response) => ({
    data: response.items.map(mapProjectSummaryToProject),
    page: response.page,
    limit: response.limit,
    total: response.total,
  }));
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
