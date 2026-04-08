import { request } from './api';

/**
 * Basic projects service template.
 */
export function getProjects(page = 1, limit = 10) {
  return request(`/projects?page=${page}&limit=${limit}`);
}

export function getProjectById(id: string) {
  return request(`/projects/${id}`);
}
