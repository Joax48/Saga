import { Injectable } from '@nestjs/common';
import type {
  ScientificProductionsListItemDto,
  ScientificProductionsPaginatedListDto,
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
  ): Promise<ScientificProductionsPaginatedListDto> {
    const scientificProductionsPage =
      await this.scientificProductionsRepository.findPaginated(page, limit);

    return {
      items: scientificProductionsPage.items.map(
        (scientificProduction): ScientificProductionsListItemDto => ({
          id: scientificProduction.id,
          title: scientificProduction.title,
          authors: scientificProduction.authors,
          type: scientificProduction.type,
          openAccess: scientificProduction.openAccess,
          publicationYear: scientificProduction.publicationYear,
          abstract: scientificProduction.abstract,
          doi: scientificProduction.doi,
          journal: scientificProduction.journal,
          volume: scientificProduction.volume,
          issue: scientificProduction.issue,
          pages: scientificProduction.pages,
          citationCount: scientificProduction.citationCount,
          keywords: scientificProduction.keywords,
        }),
      ),
      page,
      limit,
      total: scientificProductionsPage.total,
    };
  }
}
