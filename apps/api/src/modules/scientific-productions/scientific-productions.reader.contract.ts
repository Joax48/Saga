export const SCIENTIFIC_PRODUCTIONS_READER = Symbol('SCIENTIFIC_PRODUCTIONS_READER');

export interface ScientificProductionsListItemDto {
  id: string;
  title: string;
  authors: string;
  type: string;
  openAccess: boolean;
  publicationYear: number;
  doi: string;
  journal: string;
  volume: number;
  issue: number;
  pages: string;
  keywords: string;
}

export interface ScientificProductionsDetailItemDto {
  id: string;
  title: string;
  authors: string;
  principalAuthor: string;
  unit: string;
  affiliations: string;
  type: string;
  openAccess: boolean;
  publicationYear: number;
  abstract: string;
  doi: string;
  journal: string;
  volume: number;
  issue: number;
  pages: string;
  citationCount: number;
  keywords: string;
}

export interface ScientificProductionsPaginatedListDto {
  items: ScientificProductionsListItemDto[];
  page: number;
  limit: number;
  total: number;
}

export interface ScientificProductionsFiltersDto {
  q?: string;
  type?: string;
  openAccess?: boolean;
  year?: number;
  keywords?: string[];
}
export interface ScientificProductionsReader {
  getPaginatedList(
    page: number,
    limit: number,
    filters?: ScientificProductionsFiltersDto,
  ): Promise<ScientificProductionsPaginatedListDto>;
  getById(id: string): Promise<ScientificProductionsDetailItemDto | null>;
}
