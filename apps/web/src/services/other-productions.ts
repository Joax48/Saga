import { request } from './api';

/**
 * Basic other-productions service template.
 */
export function getOtherProductions(page = 1, limit = 10) {
  return request(`/other-productions?page=${page}&limit=${limit}`);
}

export function getOtherProductionById(id: string) {
  return request(`/other-productions/${id}`);
}
