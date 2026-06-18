/* eslint-disable prettier/prettier */
import { request } from './api';
import type { SummaryScientificProduction, ScientificProduction } from '@/types';

interface ScientificProductionsFilters {
  type?: string[];
  openAccess?: boolean;
  year?: string[];
  keywords?: string[];
}

interface ScientificProductionsSort {
  sortBy?: 'title' | 'publication_year';
  sortOrder?: 'asc' | 'desc';
}

interface GetScientificProductionsParams {
  page?: number;
  limit?: number;
  q?: string;
  filters?: ScientificProductionsFilters;
  sort?: ScientificProductionsSort;
}

interface AuthorReference {
  id: number;
  name: string;
  country?: string;
}

interface KeywordReference {
  id: number;
  value: string;
}

interface UnitReference {
  id: number;
  unit: string;
}

interface AffiliationReference {
  id: number;
  affiliation: string;
}

interface ApiSummaryScientificProduction {
  id: string;
  title: string;
  authors: AuthorReference[] | null;
  type: string | null;
  openAccess: boolean | null;
  publicationYear: number;
  doi: string | null;
  journal: string | null;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  source: string | null;
  keywords: KeywordReference[] | null;
}

interface ApiDetailScientificProduction {
  id: string;
  title: string;
  ucrAuthors: AuthorReference[] | null;
  externalAuthors: AuthorReference[] | null;
  unit: UnitReference[] | null;
  affiliations: AffiliationReference[] | null;
  type: string | null;
  openAccess: boolean | null;
  publicationYear: number;
  abstract: string | null;
  doi: string | null;
  journal: string | null;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  citationCount: number | null;
  source: string | null;
  keywords: KeywordReference[] | null;
}

interface ApiResponse {
  items: ApiSummaryScientificProduction[];
  page: number;
  limit: number;
  total: number;
}

export interface FiltersApiResponse {
  types?: Array<{ value: string; label: string; count: number }>;
  years?: Array<{ value: string; label: string; count: number }>;
  keywords?: Array<{ value: string; label: string; count: number }>;
  openAccessCount?: number;
}

function parseSummaryScientificProduction(
  item: ApiSummaryScientificProduction,
): SummaryScientificProduction {
  return {
    id: item.id,
    title: item.title,
    authors: item.authors ?? [],
    type: item.type ?? '',
    openAccess: item.openAccess ?? false,
    publicationYear: item.publicationYear,
    doi: item.doi ?? '',
    journal: item.journal ?? undefined,
    volume: item.volume != null ? Number(item.volume) : undefined,
    issue: item.issue != null ? Number(item.issue) : undefined,
    pages: item.pages ?? undefined,
    source: item.source ?? '',
    keywords: item.keywords ?? [],
  };
}

function parseDetailScientificProduction(
  item: ApiDetailScientificProduction,
): ScientificProduction {
  const allAuthors = [...(item.ucrAuthors ?? []), ...(item.externalAuthors ?? [])];

  const countryMap = new Map<string, number>();
  for (const author of allAuthors) {
    if (!author.country) continue;
    countryMap.set(author.country, (countryMap.get(author.country) ?? 0) + 1);
  }

  return {
    id: item.id,
    title: item.title,
    ucrAuthors: item.ucrAuthors ?? [],
    externalAuthors: item.externalAuthors ?? [],
    authors: allAuthors ?? [],
    unit: item.unit?.map((u) => u.unit).join(', ') ?? '',
    affiliations: item.affiliations?.map((a) => a.affiliation) ?? [],
    type: item.type ?? '',
    openAccess: item.openAccess ?? false,
    publicationYear: item.publicationYear,
    abstract: item.abstract ?? '',
    doi: item.doi ?? '',
    journal: item.journal ?? undefined,
    volume: item.volume != null ? Number(item.volume) : undefined,
    issue: item.issue != null ? Number(item.issue) : undefined,
    pages: item.pages ?? undefined,
    citationCount: item.citationCount ?? 0,
    source: item.source ?? '',
    keywords: item.keywords?.map((k) => k.value) ?? [],
    collaborationCountries: [...countryMap.entries()].map(([country, count]) => ({
      country,
      count,
    })),
  };
}

export async function getScientificProductions(
  params: GetScientificProductionsParams = {},
): Promise<{ items: SummaryScientificProduction[]; total: number }> {
  const { page = 1, limit = 10, q, filters, sort } = params;

  const searchParams = new URLSearchParams();
  searchParams.set('page', String(page));
  searchParams.set('limit', String(limit));

  if (q) searchParams.set('q', q);
  if (filters?.type?.length) searchParams.set('type', filters.type.join(','));
  if (filters?.openAccess) searchParams.set('openAccess', 'true');
  if (filters?.year?.length) searchParams.set('year', filters.year.join(','));
  if (filters?.keywords?.length) searchParams.set('keywords', filters.keywords.join(','));
  if (sort?.sortBy) searchParams.set('sortBy', sort.sortBy);
  if (sort?.sortOrder) searchParams.set('sortOrder', sort.sortOrder);

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

export async function getScientificProductionFilters(
  params: Omit<GetScientificProductionsParams, 'page' | 'limit'> = {},
): Promise<FiltersApiResponse> {
  const { q, filters } = params;

  const searchParams = new URLSearchParams();
  if (q) searchParams.set('q', q);
  if (filters?.type?.length) searchParams.set('type', filters.type.join(','));
  if (filters?.openAccess) searchParams.set('openAccess', 'true');
  if (filters?.year?.length) searchParams.set('year', filters.year.join(','));
  if (filters?.keywords?.length) searchParams.set('keywords', filters.keywords.join(','));

  const query = searchParams.toString();
  return request<FiltersApiResponse>(
    `/scientific-productions/filters${query ? `?${query}` : ''}`,
  );
}
