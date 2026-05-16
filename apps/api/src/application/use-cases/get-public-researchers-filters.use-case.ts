import { Inject, Injectable } from '@nestjs/common';

import {
  RESEARCHERS_READER,
  ResearchersReader,
} from '../../modules/researchers/researchers.reader.contract';

@Injectable()
export class GetResearchersFiltersUseCase {
  constructor(
    @Inject(RESEARCHERS_READER)
    private readonly reader: ResearchersReader,
  ) {}

  execute() {
    return this.reader.getFilters();
  }
}
