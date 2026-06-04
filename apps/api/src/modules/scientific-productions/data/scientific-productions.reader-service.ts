import { Injectable } from '@nestjs/common';
import type {
  ScientificProductionsListItemDto,
  ScientificProductionsPaginatedListDto,
  ScientificProductionsDetailItemDto,
  ScientificProductionsFiltersRequestDto,
  ScientificProductionsFiltersResponseDto,
  ScientificProductionsReader,
  AuthorReference,
  KeywordReference,
  UnitReference,
  AffiliationReference,
  ScientificProductionSortBy,
  ScientificProductionSortOrder,
} from '../scientific-productions.reader.contract';
import { ScientificProductionRepository } from './scientific-productions.repository';

@Injectable()
export class ScientificProductionsService implements ScientificProductionsReader {
  constructor(
    private readonly scientificProductionsRepository: ScientificProductionRepository,
  ) {}

  async getPaginatedList(
    page: number,
    limit: number,
    filters?: ScientificProductionsFiltersRequestDto,
    sortBy?: ScientificProductionSortBy,
    sortOrder?: ScientificProductionSortOrder,
  ): Promise<ScientificProductionsPaginatedListDto> {
    const scientificProductionsPage =
      await this.scientificProductionsRepository.findPaginated(
        page,
        limit,
        filters,
        sortBy,
        sortOrder,
      );

    let effectivePage = page;
    let effectiveItems = scientificProductionsPage.items;
    const totalPages = Math.max(1, Math.ceil(scientificProductionsPage.total / limit));

    if (scientificProductionsPage.total > 0 && page > totalPages) {
      effectivePage = totalPages;
      const lastPage = await this.scientificProductionsRepository.findPaginated(
        effectivePage,
        limit,
        filters,
      );
      effectiveItems = lastPage.items;
    }

    return {
      items: effectiveItems.map(
        (scientificProduction): ScientificProductionsListItemDto => ({
          id: scientificProduction.id,
          title: scientificProduction.title,
          authors: this.parseJsonSafely<AuthorReference[]>(
            scientificProduction.authors,
            [],
          ),
          type: scientificProduction.type,
          openAccess:
            scientificProduction.openAccess !== null
              ? scientificProduction.openAccess === 1
              : null,
          publicationYear: scientificProduction.publicationYear,
          doi: scientificProduction.doi,
          journal: scientificProduction.journal,
          volume: scientificProduction.volume,
          issue: scientificProduction.issue,
          pages: scientificProduction.pages,
          keywords: this.parseJsonSafely<KeywordReference[]>(
            scientificProduction.keywords,
            [],
          ),
        }),
      ),
      page: effectivePage,
      limit,
      total: scientificProductionsPage.total,
    };
  }

  async getFilters(
    filters?: ScientificProductionsFiltersRequestDto,
  ): Promise<ScientificProductionsFiltersResponseDto> {
    const facets = await this.scientificProductionsRepository.findFilters(filters);
    return {
      types: facets.types,
      years: facets.years,
      keywords: facets.keywords,
      openAccessCount: facets.openAccessCount,
    };
  }

  async getById(id: string): Promise<ScientificProductionsDetailItemDto | null> {
    const row = await this.scientificProductionsRepository.findById(id);
    if (!row) return null;

    return {
      id: row.id,
      title: row.title,
      ucrAuthors: this.parseJsonSafely<AuthorReference[]>(row.ucrAuthors, []),
      externalAuthors: this.parseJsonSafely<AuthorReference[]>(row.externalAuthors, []),
      unit: this.parseJsonSafely<UnitReference[]>(row.unit, []),
      affiliations: this.parseJsonSafely<AffiliationReference[]>(row.affiliations, []),
      type: row.type,
      openAccess: row.openAccess !== null ? row.openAccess === 1 : null,
      publicationYear: row.publicationYear,
      abstract: row.abstract,
      doi: row.doi,
      journal: row.journal,
      volume: row.volume,
      issue: row.issue,
      pages: row.pages,
      citationCount: row.citationCount,
      keywords: this.parseJsonSafely<KeywordReference[]>(row.keywords, []),
    };
  }

  parseJsonSafely<T>(value: unknown, fallback: T): T {
    if (value === null || value === undefined || value === '') return fallback;
    if (typeof value !== 'string') return value as T;
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
}
