import { Inject, Injectable } from '@nestjs/common';

import { PaginatedListRequestDto } from '../../bff/public/common/dtos/paginated-list-request.dto';
import { PaginatedListResponseDto } from '../../bff/public/common/dtos/paginated-list-response.dto';
import { ScientificProductioSummaryResponseDto } from '../../bff/public/scientific-productions/dtos/public-scientific-productions-summary-response.dto';

import {
  SCIENTIFIC_PRODUCTIONS_READER,
  type ScientificProductionsPaginatedListDto,
  type ScientificProductionsReader,
} from '../../modules/scientific-productions/scientific-productions.reader.contract';

@Injectable()
export class GetScientificProductionPaginatedListUseCase {
  constructor(
    @Inject(SCIENTIFIC_PRODUCTIONS_READER)
    private readonly scientificProductionsReader: ScientificProductionsReader,
  ) {}

  async execute(
    input: PaginatedListRequestDto,
  ): Promise<PaginatedListResponseDto<ScientificProductioSummaryResponseDto>> {
    const scientificProductions = await this.scientificProductionsReader.getPaginatedList(
      input.page,
      input.limit,
    );
    return this.mapToResponseDto(scientificProductions);
  }

  private mapToResponseDto(
    scientificProductions: ScientificProductionsPaginatedListDto,
  ): PaginatedListResponseDto<ScientificProductioSummaryResponseDto> {
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
        keywords: scientificProduction.keywords,
      })),
      page: scientificProductions.page,
      limit: scientificProductions.limit,
      total: scientificProductions.total,
    };
  }
}
