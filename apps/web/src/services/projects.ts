import { request } from './api';
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
  ProjectSortBy,
  ProjectSortOrder,
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

export interface ProjectListFilters extends Omit<ProjectQueryFilters, 'sortBy' | 'sortOrder'> {}

export interface ProjectListSort {
  sortBy?: ProjectSortBy;
  sortOrder?: ProjectSortOrder;
}

export interface GetProjectsParams {
  page?: number;
  limit?: number;
  q?: string;
  filters?: ProjectListFilters;
  sort?: ProjectListSort;
}

export interface GetProjectFiltersParams {
  q?: string;
  filters?: ProjectListFilters;
}

/**
 * Returns a paginated list of projects from backend API.
 */
export async function getProjects({
  page = 1,
  limit = 10,
  q = '',
  filters = {},
  sort,
}: GetProjectsParams = {}): Promise<PaginatedProjectList> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (q.trim()) {
    params.set('q', q.trim());
  }

  const appendArrayFilter = (key: string, values?: string[]) => {
    if (!values || values.length === 0) return;

    const normalizedValues = values.map((value) => value.trim()).filter(Boolean);
    if (normalizedValues.length === 0) return;

    params.set(key, normalizedValues.join(','));
  };

  appendArrayFilter('researchType', filters.researchType);
  appendArrayFilter('projectType', filters.projectType);
  appendArrayFilter('startYear', filters.startYear);
  appendArrayFilter('status', filters.status);
  appendArrayFilter('participants', filters.participants);
  appendArrayFilter('keywords', filters.keywords);

  if (sort?.sortBy) {
    params.set('sortBy', sort.sortBy);
  }

  if (sort?.sortOrder) {
    params.set('sortOrder', sort.sortOrder);
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
 * Returns a project detail from backend API.
 */
export async function getProjectById(id: string): Promise<Project> {
  const encodedId = encodeURIComponent(id);
  const response = await request<ProjectDetailApiDto>(`/projects/${encodedId}`);

  return mapProjectDetailToProject(response);
}

/**
 * Returns filter facets for the projects page from backend API.
 */
export async function getProjectFilters(
  { q = '', filters = {} }: GetProjectFiltersParams = {},
): Promise<ProjectFilters> {
  const params = new URLSearchParams();

  if (q.trim()) {
    params.set('q', q.trim());
  }

  const appendArrayFilter = (key: string, values?: string[]) => {
    if (!values || values.length === 0) return;

    const normalizedValues = values.map((value) => value.trim()).filter(Boolean);
    if (normalizedValues.length === 0) return;

    params.set(key, normalizedValues.join(','));
  };

  appendArrayFilter('researchType', filters.researchType);
  appendArrayFilter('projectType', filters.projectType);
  appendArrayFilter('startYear', filters.startYear);
  appendArrayFilter('status', filters.status);
  appendArrayFilter('participants', filters.participants);
  appendArrayFilter('keywords', filters.keywords);

  const query = params.toString();
  const endpoint = query ? `/projects/filters?${query}` : '/projects/filters';
  return request<ProjectFilters>(endpoint);
}
