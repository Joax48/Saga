import { Inject, Injectable } from '@nestjs/common';

import { PaginatedListResponseDto } from '../../bff/public/common/dtos/paginated-list-response.dto';
import { ResearchersListRequestDto } from '../../bff/public/researchers/dtos/researchers-list-request.dto';
import { ResearcherSummaryResponseDto } from '../../bff/public/researchers/dtos/researcher-summary-response.dto';

import {
  RESEARCHERS_READER,
  type ResearchersFiltersRequestDto,
  type ResearchersPaginatedListDto,
  type ResearchersReader,
} from '../../modules/researchers/researchers.reader.contract';

@Injectable()
export class GetResearchersPaginatedListUseCase {
  constructor(
    @Inject(RESEARCHERS_READER)
    private readonly researchersReader: ResearchersReader,
  ) {}

  async execute(
    input: ResearchersListRequestDto,
  ): Promise<PaginatedListResponseDto<ResearcherSummaryResponseDto>> {
    const filters: ResearchersFiltersRequestDto = {
      unit: input.unit,
      profileType: input.profileType,
      collaborationCountry: input.collaborationCountry,
      sortOrder: input.sortOrder,
    };

    const researchers = await this.researchersReader.getPaginatedList(
      input.page,
      input.limit,
      input.q,
      filters,
    );

    return this.mapToResponseDto(researchers);
  }

  private mapToResponseDto(
    researchers: ResearchersPaginatedListDto,
  ): PaginatedListResponseDto<ResearcherSummaryResponseDto> {
    return {
      items: researchers.items.map((researcher) => ({
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
        photo: researcher.photo,
        profileType: researcher.profileType,
        linkedUnits: researcher.linkedUnits,
        workUnits: researcher.workUnits,
      })),
      page: researchers.page,
      limit: researchers.limit,
      total: researchers.total,
    };
  }
}
