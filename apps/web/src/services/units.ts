import { request } from './api';

/**
 * Unit summary from the public units API list endpoint.
 */
export interface Unit {
  id: number;
  name: string;
  imageUrl: string;
}

/**
 * Generic paginated response contract used by the BFF list endpoints.
 */
interface PaginatedListResponseDto<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

/**
 * Paginated Units response for frontend.
 */
export interface PaginatedUnitsResponse {
  data: Unit[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Fetches a paginated list of units from the backend.
 *
 * Search parameters are currently accepted for API compatibility,
 * but they are not yet used by the active backend endpoint.
 */
export function getUnits(
  page = 1,
  limit = 9,
  searchQuery = ''
): Promise<PaginatedUnitsResponse> {
  return request<PaginatedListResponseDto<Unit>>(
    `/units?page=${page}&limit=${limit}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}`
  ).then((response) => ({
    data: response.items,
    page: response.page,
    limit: response.limit,
    total: response.total,
  }));
}

/**
 * Note: Unit detail endpoint (GET /units/{id}) is not yet implemented in the backend.
 * This function will be available once the API is extended.
 */
export function getUnitById(id: number): Promise<Unit> {
  // TODO: Implement when backend provides GET /units/{id} endpoint
  return Promise.reject(new Error('Unit detail endpoint not yet implemented in the backend'));
}
