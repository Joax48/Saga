export const SCIENTIFIC_PRODUCTIONS_READER = Symbol('SCIENTIFIC_PRODUCTIONS_READER');

export interface ScientificProductionsListItemDto {
  id: string;
  title: string;
  authors: string;
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

export interface ScientificProductionsReader {
  getPaginatedList(
    page: number,
    limit: number,
  ): Promise<ScientificProductionsPaginatedListDto>;
}
