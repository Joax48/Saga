import { Inject, Injectable } from '@nestjs/common';

import {
  RESEARCHERS_READER,
  type ResearchersFiltersRequestDto,
  type ResearchersReader,
} from '../../modules/researchers/researchers.reader.contract';

/**
 * Serves the collaboration-country facet on its own endpoint so the slow
 * co-authorship query never blocks the fast unit filter (GetResearchersFilters).
 */
@Injectable()
export class GetResearchersCollaborationFacetUseCase {
  constructor(
    @Inject(RESEARCHERS_READER)
    private readonly reader: ResearchersReader,
  ) {}

  execute(query?: string, filters?: ResearchersFiltersRequestDto) {
    return this.reader.getCollaborationFacet(query, filters);
  }
}
