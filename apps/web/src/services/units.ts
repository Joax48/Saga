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
  searchQuery = '',
): Promise<PaginatedUnitsResponse> {
  return request<PaginatedListResponseDto<Unit>>(
    `/units?page=${page}&limit=${limit}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}`,
  ).then((response) => ({
    data: response.items,
    page: response.page,
    limit: response.limit,
    total: response.total,
  }));
}

/**
 * Unit detail returned by GET /units/:id.
 */
export interface UnitDetail {
  id: number;
  name: string;
  description: string;
  email: string;
  pageUrl: string;
  phoneNumber: string;
}

export function getUnitById(id: number): Promise<UnitDetail> {
  return request<UnitDetail>(`/units/${id}`);
}
