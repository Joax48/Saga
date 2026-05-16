import { Inject, Injectable } from '@nestjs/common';
import { ScientificProductionsFiltersRequestDto } from '../../bff/public/scientific-productions/dtos/scientific-productions-filters-request.dto';
import { ScientificProductionsFiltersResponseDto } from '../../bff/public/scientific-productions/dtos/public-scientific-production-filters-response.dto';

import {
  SCIENTIFIC_PRODUCTIONS_READER,
  type ScientificProductionsReader,
} from '../../modules/scientific-productions/scientific-productions.reader.contract';

@Injectable()
export class GetScientificProductionsFiltersUseCase {
  constructor(
    @Inject(SCIENTIFIC_PRODUCTIONS_READER)
    private readonly reader: ScientificProductionsReader,
  ) {}

  async execute(
    filters?: ScientificProductionsFiltersRequestDto,
  ): Promise<ScientificProductionsFiltersResponseDto> {
    return this.reader.getFilters(filters);
  }
}
