/* eslint-disable prettier/prettier */
import { request } from './api';
import type { SummaryScientificProduction, ScientificProduction } from '@/types';

interface GetScientificProductionsParams {
  page?: number;
  limit?: number;
  q?: string;
  type?: string[];
  openAccess?: boolean;
  year?: string[];
  keywords?: string[];
  sortBy?: 'title' | 'publication_year';
  sortOrder?: 'asc' | 'desc';
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
    open_access: item.openAccess ?? false,
    publication_year: item.publicationYear,
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
    open_access: item.openAccess ?? false,
    publication_year: item.publicationYear,
    abstract: item.abstract ?? '',
    doi: item.doi ?? '',
    journal: item.journal ?? undefined,
    volume: item.volume != null ? Number(item.volume) : undefined,
    issue: item.issue != null ? Number(item.issue) : undefined,
    pages: item.pages ?? undefined,
    citation_count: item.citationCount ?? 0,
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
  const {
    page = 1,
    limit = 10,
    q,
    type,
    openAccess,
    year,
    keywords,
    sortBy,
    sortOrder,
  } = params;

  const searchParams = new URLSearchParams();
  searchParams.set('page', String(page));
  searchParams.set('limit', String(limit));

  if (q) searchParams.set('q', q);
  if (type?.length) searchParams.set('type', type.join(','));
  if (openAccess) searchParams.set('openAccess', 'true');
  if (year?.length) searchParams.set('year', year.join(','));
  if (keywords?.length) searchParams.set('keywords', keywords.join(','));
  if (sortBy) searchParams.set('sortBy', sortBy);
  if (sortOrder) searchParams.set('sortOrder', sortOrder);

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
  const { q, type, openAccess, year, keywords } = params;

  const searchParams = new URLSearchParams();
  if (q) searchParams.set('q', q);
  if (type?.length) searchParams.set('type', type.join(','));
  if (openAccess) searchParams.set('openAccess', 'true');
  if (year?.length) searchParams.set('year', year.join(','));
  if (keywords?.length) searchParams.set('keywords', keywords.join(','));

  const query = searchParams.toString();
  return request<FiltersApiResponse>(
    `/scientific-productions/filters${query ? `?${query}` : ''}`,
  );
}
