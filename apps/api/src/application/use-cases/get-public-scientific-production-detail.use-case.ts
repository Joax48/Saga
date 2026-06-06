import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { ScientificProductionDetailResponseDto } from '../../bff/public/scientific-productions/dtos/public-scientific-production-detail-response.dto';

import {
  SCIENTIFIC_PRODUCTIONS_READER,
  type ScientificProductionsReader,
} from '../../modules/scientific-productions/scientific-productions.reader.contract';

@Injectable()
export class GetScientificProductionDetailUseCase {
  constructor(
    @Inject(SCIENTIFIC_PRODUCTIONS_READER)
    private readonly scientificProductionsReader: ScientificProductionsReader,
  ) {}

  async execute(id: string): Promise<ScientificProductionDetailResponseDto> {
    const item = await this.scientificProductionsReader.getById(id);

    if (!item) {
      throw new NotFoundException(`Scientific production with id "${id}" not found`);
    }

    return {
      id: item.id,
      title: item.title,
      ucrAuthors: item.ucrAuthors,
      externalAuthors: item.externalAuthors,
      unit: item.unit,
      affiliations: item.affiliations,
      type: item.type,
      openAccess: item.openAccess,
      publicationYear: item.publicationYear,
      abstract: item.abstract,
      doi: item.doi,
      journal: item.journal,
      volume: item.volume,
      issue: item.issue,
      pages: item.pages,
      citationCount: item.citationCount,
      source: item.source,
      keywords: item.keywords,
    };
  }
}
