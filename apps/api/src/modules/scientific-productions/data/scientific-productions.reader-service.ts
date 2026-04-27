import { Injectable } from '@nestjs/common';
import type {
  ScientificProductionsListItemDto,
  ScientificProductionsPaginatedListDto,
  ScientificProductionsDetailItemDto,
  ScientificProductionsFiltersDto,
  ScientificProductionsReader,
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
    filters?: ScientificProductionsFiltersDto,
  ): Promise<ScientificProductionsPaginatedListDto> {
    const scientificProductionsPage =
      await this.scientificProductionsRepository.findPaginated(page, limit, filters);

    return {
      items: scientificProductionsPage.items.map(
        (scientificProduction): ScientificProductionsListItemDto => ({
          id: scientificProduction.id,
          title: scientificProduction.title,
          authors: scientificProduction.authors,
          type: scientificProduction.type,
          openAccess: scientificProduction.openAccess,
          publicationYear: scientificProduction.publicationYear,
          doi: scientificProduction.doi,
          journal: scientificProduction.journal,
          volume: scientificProduction.volume,
          issue: scientificProduction.issue,
          pages: scientificProduction.pages,
          keywords: scientificProduction.keywords,
        }),
      ),
      page,
      limit,
      total: scientificProductionsPage.total,
    };
  }

  async getById(id: string): Promise<ScientificProductionsDetailItemDto | null> {
    const row = await this.scientificProductionsRepository.findById(id);
    if (!row) return null;

    return {
      id: row.id,
      title: row.title,
      authors: row.authors,
      principalAuthor: row.principalAuthor,
      unit: row.unit,
      affiliations: row.affiliations,
      type: row.type,
      openAccess: row.openAccess,
      publicationYear: row.publicationYear,
      abstract: row.abstract,
      doi: row.doi,
      journal: row.journal,
      volume: row.volume,
      issue: row.issue,
      pages: row.pages,
      citationCount: row.citationCount,
      keywords: row.keywords,
    };
  }
}
