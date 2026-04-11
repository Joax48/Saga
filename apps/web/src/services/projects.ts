import {
  getMockProjectById,
  getMockProjectsPaginated,
  getMockProjectFilters,
  type Project,
  type PaginatedProjects,
  type ProjectFilters,
  type ProjectQueryFilters,
} from '@/mocks/projects-data';

export function getProjects(
  page = 1,
  limit = 10,
  searchQuery = '',
  queryFilters: ProjectQueryFilters = {},
): Promise<PaginatedProjects> {
  return Promise.resolve(
    getMockProjectsPaginated(page, limit, searchQuery, queryFilters),
  );
}

export function getProjectById(id: string): Promise<Project> {
  const project = getMockProjectById(id);

  if (!project) {
    return Promise.reject(new Error('Project not found'));
  }

  return Promise.resolve(project);
}

export function getProjectFilters(): Promise<ProjectFilters> {
  return Promise.resolve(getMockProjectFilters());
}
