// Use case: collaboration-network countries for a single researcher profile.
import { Inject, Injectable } from '@nestjs/common';

import {
  RESEARCHERS_READER,
  type ResearcherCollaborationCountryDto,
  type ResearchersReader,
} from '../../modules/researchers/researchers.reader.contract';

@Injectable()
export class GetResearcherCollaborationCountriesUseCase {
  constructor(
    @Inject(RESEARCHERS_READER)
    private readonly researchersReader: ResearchersReader,
  ) {}

  execute(id: string): Promise<ResearcherCollaborationCountryDto[]> {
    return this.researchersReader.getCollaborationCountries(id);
  }
}
