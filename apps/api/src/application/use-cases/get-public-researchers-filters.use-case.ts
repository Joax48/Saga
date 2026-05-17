import { Inject, Injectable } from '@nestjs/common';

import {
  RESEARCHERS_READER,
  ResearchersReader,
  ResearchersFiltersRequestDto,
} from '../../modules/researchers/researchers.reader.contract';

@Injectable()
export class GetResearchersFiltersUseCase {
  constructor(
    @Inject(RESEARCHERS_READER)
    private readonly reader: ResearchersReader,
  ) {}

  execute(query?: string, filters?: ResearchersFiltersRequestDto) {
    return this.reader.getFilters(query, filters);
  }
}
