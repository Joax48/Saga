import { request } from './api';

/**
 * Basic researchers service template.
 */
export function getResearchers(page = 1, limit = 10) {
  return request(`/researchers?page=${page}&limit=${limit}`);
}

export function getResearcherById(id: string) {
  return request(`/researchers/${id}`);
}
