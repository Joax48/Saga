// caso de uso para obtener investigadores por id
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { ResearcherSummaryResponseDto } from '../../bff/public/researchers/dtos/researcher-summary-response.dto';
import {
  RESEARCHERS_READER,
  type ResearchersReader,
} from '../../modules/researchers/researchers.reader.contract';

@Injectable()
export class GetResearcherDetailUseCase {
  constructor(
    @Inject(RESEARCHERS_READER)
    private readonly researchersReader: ResearchersReader,
  ) {}

  async execute(id: string): Promise<ResearcherSummaryResponseDto> {
    const researcher = await this.researchersReader.getById(id);

    if (!researcher) {
      throw new NotFoundException(`Researcher with id "${id}" not found`);
    }

    return {
      id: researcher.id,
      idUcrProfile: researcher.idUcrProfile,
      baseUnit: researcher.baseUnit,
      name: researcher.name,
      firstSurname: researcher.firstSurname,
      secondSurname: researcher.secondSurname,
      ceaCategory: researcher.ceaCategory,
      institution: researcher.institution,
      country: researcher.country,
      institutions: researcher.institutions ?? [],
      orcidId: researcher.orcidId,
      linkedin: researcher.linkedin,
      researchGate: researcher.researchGate,
      scopus: researcher.scopus,
      photoUrl: researcher.photoUrl,
      profileType: researcher.profileType,
      linkedUnits: researcher.linkedUnits,
      workUnits: researcher.workUnits,
    };
  }
}
