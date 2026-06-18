import { Inject, Injectable } from '@nestjs/common';

import { PaginatedListResponseDto } from '../../bff/public/common/dtos/paginated-list-response.dto';
import { ScientificProductionSummaryResponseDto } from '../../bff/public/scientific-productions/dtos/public-scientific-productions-summary-response.dto';

import {
  SCIENTIFIC_PRODUCTIONS_READER,
  type ScientificProductionsPaginatedListDto,
  type ScientificProductionsReader,
} from '../../modules/scientific-productions/scientific-productions.reader.contract';
import { ScientificProductionsListRequestDto } from '../../bff/public/scientific-productions/dtos/scientific-productions-list-request.dto';

@Injectable()
export class GetScientificProductionPaginatedListUseCase {
  constructor(
    @Inject(SCIENTIFIC_PRODUCTIONS_READER)
    private readonly scientificProductionsReader: ScientificProductionsReader,
  ) {}

  async execute(
    input: ScientificProductionsListRequestDto,
  ): Promise<PaginatedListResponseDto<ScientificProductionSummaryResponseDto>> {
    const scientificProductions = await this.scientificProductionsReader.getPaginatedList(
      input.page,
      input.limit,
      input.q,
      {
        type: input.type,
        openAccess: input.openAccess,
        year: input.year,
        keywords: input.keywords,
      },
      {
        sortBy: input.sortBy,
        sortOrder: input.sortOrder,
      },
    );
    return this.mapToResponseDto(scientificProductions);
  }

  private mapToResponseDto(
    scientificProductions: ScientificProductionsPaginatedListDto,
  ): PaginatedListResponseDto<ScientificProductionSummaryResponseDto> {
    return {
      items: scientificProductions.items.map((scientificProduction) => ({
        id: scientificProduction.id,
        title: scientificProduction.title,
        type: scientificProduction.type,
        publicationYear: scientificProduction.publicationYear,
        openAccess: scientificProduction.openAccess,
        doi: scientificProduction.doi,
        authors: scientificProduction.authors,
        journal: scientificProduction.journal,
        volume: scientificProduction.volume,
        issue: scientificProduction.issue,
        pages: scientificProduction.pages,
        source: scientificProduction.source,
        keywords: scientificProduction.keywords,
      })),
      page: scientificProductions.page,
      limit: scientificProductions.limit,
      total: scientificProductions.total,
    };
  }
}
