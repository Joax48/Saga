import { request } from './api';
import { getMockProjectFilters, PROJECT_DETAIL_EXAMPLE } from '@/mocks/projects-data';
import { mapProjectSummaryToProject } from '@/mappers/projects.mappers';
import type {
  PaginatedListResponseDto,
  PaginatedProjectList,
  Project,
  ProjectFilters,
  ProjectQueryFilters,
  ProjectSummaryApiDto,
  ProjectSummaryItem,
} from '@/types/projects.types';

export type {
  PaginatedProjectList,
  Project,
  ProjectFilters,
  ProjectQueryFilters,
  ProjectSummaryItem,
};

/**
 * Returns a paginated list of projects from backend API.
 */
export async function getProjects(
  page = 1,
  limit = 10,
  searchQuery = '',
  _queryFilters: ProjectQueryFilters = {},
): Promise<PaginatedProjectList> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (searchQuery.trim()) {
    params.set('q', searchQuery.trim());
  }

  const endpoint = `/projects?${params.toString()}`;
  const response =
    await request<PaginatedListResponseDto<ProjectSummaryApiDto>>(endpoint);

  return {
    data: response.items.map(mapProjectSummaryToProject),
    total: response.total,
    page: response.page,
    limit: response.limit,
  };
}

/**
 * Returns a static example used in the project detail page for every project.
 */
export function getProjectById(_id: string): Promise<Project> {
  return Promise.resolve({
    ...PROJECT_DETAIL_EXAMPLE,
  });
}

/**
 * Returns mock filter facets for the projects page.
 */
export async function getProjectFilters(): Promise<ProjectFilters> {
  return Promise.resolve(getMockProjectFilters());
}
