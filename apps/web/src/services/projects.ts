import {
  getMockProjectById,
  getMockProjectFilters,
  getMockProjectsPaginated,
  type PaginatedProjects,
  type Project,
  type ProjectFilters,
  type ProjectQueryFilters,
} from '@/mocks/projects-data';

export type { PaginatedProjects, Project, ProjectFilters, ProjectQueryFilters };

/**
 * Returns a paginated list of mock projects.
 *
 * Search and filter parameters are applied locally against the simulated dataset.
 */
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

/**
 * Returns a project by id/code from the simulated dataset.
 */
export function getProjectById(id: string): Promise<Project> {
  const project = getMockProjectById(id);

  if (!project) {
    return Promise.reject(new Error('Project not found'));
  }

  return Promise.resolve(project);
}

/**
 * Returns the mock filter facets used by the projects page.
 */
export function getProjectFilters(): Promise<ProjectFilters> {
  return Promise.resolve(getMockProjectFilters());
}
