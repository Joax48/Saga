/**
 * API client to connect with BFF backend
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
