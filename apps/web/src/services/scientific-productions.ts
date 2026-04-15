import { request, API_BASE } from './api';
import type { ScientificProduction } from '@/types';

interface ApiScientificProduction {
  id: string;
  title: string;
  authors: string; // JSON string
  principalAuthor: string;
  unit: string;
  affiliations: string; // JSON string
  type: string; // JSON string
  openAccess: boolean;
  publicationYear: number;
  abstract: string;
  doi: string;
  journal?: string;
  volume?: number;
  issue?: number;
  pages?: string;
  citationCount: number;
  keywords: string; // JSON string
}

interface ApiResponse {
  items: ApiScientificProduction[];
  page: number;
  limit: number;
  total: number;
}

function parseScientificProduction(item: ApiScientificProduction): ScientificProduction {
  return {
    id: item.id,
    title: item.title,
    authors: JSON.parse(item.authors),
    principalAuthor: item.principalAuthor,
    unit: item.unit,
    affiliations: JSON.parse(item.affiliations ?? '[]'),
    type: JSON.parse(item.type),
    open_access: item.openAccess,
    publication_year: item.publicationYear,
    abstract: item.abstract,
    doi: item.doi,
    journal: item.journal,
    volume: item.volume,
    issue: item.issue,
    pages: item.pages,
    citation_count: item.citationCount,
    keywords: JSON.parse(item.keywords),
  };
}

export async function getScientificProductions(
  page = 1,
  limit = 10,
): Promise<{ items: ScientificProduction[]; total: number }> {
  const endpoint = `/scientific-productions?page=${page}&limit=${limit}`;

  try {
    const response = await request<ApiResponse>(endpoint);
    console.log('Fetched successfully:', response.items.length, 'items');

    return {
      items: response.items.map(parseScientificProduction),
      total: response.total,
    };
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export async function getScientificProductionById(
  id: string,
): Promise<ScientificProduction> {
  const response = await request<ApiScientificProduction>(
    `/scientific-productions/${id}`,
  );
  return parseScientificProduction(response);
}
