import { request } from './api';
import { getMockProjectFilters } from '@/mocks/projects-data';
import {
  mapProjectDetailToProject,
  mapProjectSummaryToProject,
} from '@/mappers/projects.mappers';
import type {
  PaginatedListResponseDto,
  PaginatedProjectList,
  Project,
  ProjectDetailApiDto,
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
  queryFilters: ProjectQueryFilters = {},
): Promise<PaginatedProjectList> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (searchQuery.trim()) {
    params.set('q', searchQuery.trim());
  }

  const appendArrayFilter = (key: string, values?: string[]) => {
    if (!values || values.length === 0) return;

    const normalizedValues = values.map((value) => value.trim()).filter(Boolean);
    if (normalizedValues.length === 0) return;

    params.set(key, normalizedValues.join(','));
  };

  appendArrayFilter('researchType', queryFilters.researchType);
  appendArrayFilter('projectType', queryFilters.projectType);
  appendArrayFilter('startYear', queryFilters.startYear);
  appendArrayFilter('status', queryFilters.status);
  appendArrayFilter('participants', queryFilters.participants);
  appendArrayFilter('keywords', queryFilters.keywords);

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
 * Returns a project detail from backend API.
 */
export async function getProjectById(id: string): Promise<Project> {
  const encodedId = encodeURIComponent(id);
  const response = await request<ProjectDetailApiDto>(`/projects/${encodedId}`);

  return mapProjectDetailToProject(response);
}

/**
 * Returns mock filter facets for the projects page.
 */
export async function getProjectFilters(): Promise<ProjectFilters> {
  return Promise.resolve(getMockProjectFilters());
}
