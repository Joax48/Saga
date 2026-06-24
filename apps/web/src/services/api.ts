/**
 * API client to connect with BFF backend
 */

// Used by the server (e.g. the web Docker container) for SSR situations.
// Prefer the internal API host, but fall back to the public URL for local dev.
const serverApiBase =
  process.env.API_URL_INTERNAL?.trim() || process.env.NEXT_PUBLIC_API_URL?.trim();

// Used by the browser — runs locally
const clientApiBase = process.env.NEXT_PUBLIC_API_URL?.trim();

// Figure out if code is running in a Node.js process (server side) or in the browser (client side)
const rawApiBase =
  typeof window === 'undefined'
    ? (serverApiBase ?? 'http://localhost:3001')
    : (clientApiBase ?? 'http://localhost:3001');

const normalizedApiBase = rawApiBase.replace(/\/+$/, '');

export const API_BASE = normalizedApiBase.endsWith('/api')
  ? normalizedApiBase
  : `${normalizedApiBase}/api`;

export async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  console.log('API_BASE resolves to: ', API_BASE);
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json();
}
