import { request } from './api';

/**
 * Basic scientific productions service template.
 */
export function getScientificProductions(page = 1, limit = 10) {
  return request(`/scientific-productions?page=${page}&limit=${limit}`);
}

export function getScientificProductionById(id: string) {
  return request(`/scientific-productions/${id}`);
}
