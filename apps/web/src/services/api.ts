/**
 * API client to connect with BFF backend
 */

const envApiBase = process.env.NEXT_PUBLIC_API_URL?.trim();
const rawApiBase =
  envApiBase && envApiBase.length > 0 ? envApiBase : 'http://localhost:3001';
const normalizedApiBase = rawApiBase.replace(/\/+$/, '');

export const API_BASE = normalizedApiBase.endsWith('/api')
  ? normalizedApiBase
  : `${normalizedApiBase}/api`;

export async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json();
}
