export const SCIENTIFIC_PRODUCTIONS_READER = Symbol('SCIENTIFIC_PRODUCTIONS_READER');

export interface AuthorReference {
  id: number;
  name: string;
}

export interface UnitReference {
  id: number;
  unit: string;
}

export interface AffiliationReference {
  id: number;
  affiliation: string;
}

export interface KeywordReference {
  id: number;
  value: string;
}

export interface ScientificProductionsListItemDto {
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

export interface ScientificProductionsDetailItemDto {
  id: string;
  title: string;
  ucrAuthors: AuthorReference[] | null;
  externalAuthors: AuthorReference[] | null;
  unit: UnitReference[] | null;
  affiliations: AffiliationReference[] | null;
  type: string | null;
  openAccess: boolean | null; // ← 0/1 de Oracle
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

export interface ScientificProductionsPaginatedListDto {
  items: ScientificProductionsListItemDto[];
  page: number;
  limit: number;
  total: number;
}

class FilterOptionDto {
  value!: string;
  label!: string;
  count!: number;
}

export interface ScientificProductionsFiltersResponseDto {
  types?: FilterOptionDto[];
  years?: FilterOptionDto[];
  keywords?: FilterOptionDto[];
  openAccessCount?: number;
}

export interface ScientificProductionsFiltersRequestDto {
  q?: string;
  type?: string[];
  openAccess?: boolean;
  year?: string[];
  keywords?: string[];
}

export type ScientificProductionSortBy = 'title' | 'publication_year';
export type ScientificProductionSortOrder = 'asc' | 'desc';

export interface ScientificProductionsSortRequestDto {
  sortBy?: ScientificProductionSortBy;
  sortOrder?: ScientificProductionSortOrder;
}

export interface ScientificProductionsReader {
  getPaginatedList(
    page: number,
    limit: number,
    query?: string,
    filters?: ScientificProductionsFiltersRequestDto,
    sort?: ScientificProductionsSortRequestDto,
  ): Promise<ScientificProductionsPaginatedListDto>;
  getById(id: string): Promise<ScientificProductionsDetailItemDto | null>;
  getFilters(
    filters?: ScientificProductionsFiltersRequestDto,
  ): Promise<ScientificProductionsFiltersResponseDto>;
}
