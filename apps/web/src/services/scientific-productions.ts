/* eslint-disable prettier/prettier */
import { request, API_BASE } from './api';
import type {
  SummaryScientificProduction,
  ScientificProduction,
  ProductionFilters,
} from '@/types';

interface GetScientificProductionsParams {
  page?: number;
  limit?: number;
  q?: string;
  type?: string;
  openAccess?: boolean;
  year?: number;
  keywords?: string[];
}

interface ApiSummaryScientificProduction {
  id: string;
  title: string;
  authors: string; // JSON string
  type: string; // JSON string
  openAccess: boolean;
  publicationYear: number;
  doi: string;
  journal?: string;
  volume?: number;
  issue?: number;
  pages?: string;
  keywords: string; // JSON string
}

interface ApiDetailScientificProduction {
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
  items: ApiSummaryScientificProduction[];
  page: number;
  limit: number;
  total: number;
}

function parseSummaryScientificProduction(
  item: ApiSummaryScientificProduction,
): SummaryScientificProduction {
  return {
    id: item.id,
    title: item.title,
    authors: JSON.parse(item.authors),
    type: JSON.parse(item.type),
    open_access: item.openAccess,
    publication_year: item.publicationYear,
    doi: item.doi,
    journal: item.journal,
    volume: item.volume,
    issue: item.issue,
    pages: item.pages,
    keywords: JSON.parse(item.keywords),
  };
}

function parseDetailScientificProduction(
  item: ApiDetailScientificProduction,
): ScientificProduction {
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
  params: GetScientificProductionsParams = {},
): Promise<{ items: SummaryScientificProduction[]; total: number }> {
  const { page = 1, limit = 10, q, type, openAccess, year, keywords } = params;

  const searchParams = new URLSearchParams();
  searchParams.set('page', String(page));
  searchParams.set('limit', String(limit));

  if (q) searchParams.set('q', q);
  if (type) searchParams.set('type', type);
  if (openAccess) searchParams.set('openAccess', 'true');
  if (year) searchParams.set('year', String(year));
  if (keywords?.length) searchParams.set('keywords', keywords.join(','));

  const endpoint = `/scientific-productions?${searchParams.toString()}`;

  const response = await request<ApiResponse>(endpoint);

  return {
    items: response.items.map(parseSummaryScientificProduction),
    total: response.total,
  };
}

export async function getScientificProductionById(
  id: string,
): Promise<ScientificProduction> {
  const response = await request<ApiDetailScientificProduction>(
    `/scientific-productions/${id}`,
  );
  return parseDetailScientificProduction(response);
}
