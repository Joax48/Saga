import { request } from './api';

/**
 * Basic units service template.
 */
export function getUnits(page = 1, limit = 10) {
  return request(`/units?page=${page}&limit=${limit}`);
}

export function getUnitById(id: string) {
  return request(`/units/${id}`);
}
