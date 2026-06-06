import {
  Controller,
  Get,
  Param,
  Query,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { PaginatedListResponseDto } from '../common/dtos/paginated-list-response.dto';
import { ResearcherProfileResponseDto } from './dtos/researcher-profile-response.dto';
import { ResearcherSummaryResponseDto } from './dtos/researcher-summary-response.dto';
import { ResearchersListRequestDto } from './dtos/researchers-list-request.dto';
import { ResearchersListRequestAnidatedDto } from './dtos/researchers-list-request-anidated.dto';
import { ResearchersFiltersRequestQueryDto } from './dtos/researchers-filters-request.dto';
import { GetResearchersPaginatedListUseCase } from '../../../application/use-cases/get-public-researchers-paginated-list.use-case';
import { GetResearcherDetailUseCase } from '../../../application/use-cases/get-public-researcher-detail.use-case';
import { GetResearcherProfileUseCase } from '../../../application/use-cases/get-public-researcher-profile.use-case';
import { GetResearchersFiltersUseCase } from '../../../application/use-cases/get-public-researchers-filters.use-case';
import { GetResearcherCollaborationCountriesUseCase } from '../../../application/use-cases/get-public-researcher-collaboration-countries.use-case';
import { GetResearchersCollaborationFacetUseCase } from '../../../application/use-cases/get-public-researchers-collaboration-facet.use-case';
import { UpdateResearcherLinksUseCase } from '../../../application/use-cases/update-researcher-links.use-case';
import { UpdateResearcherLinksDto } from './dtos/researcher-update-links.dto';

@Controller('researchers')
export class PublicResearchersController {
  constructor(
    private readonly getResearchersPaginatedListUseCase: GetResearchersPaginatedListUseCase,
    private readonly getResearcherDetailUseCase: GetResearcherDetailUseCase,
    private readonly getResearcherProfileUseCase: GetResearcherProfileUseCase,
    private readonly getResearchersFiltersUseCase: GetResearchersFiltersUseCase,
    private readonly getResearcherCollaborationCountriesUseCase: GetResearcherCollaborationCountriesUseCase,
    private readonly getResearchersCollaborationFacetUseCase: GetResearchersCollaborationFacetUseCase,
    private readonly updateResearcherLinksUseCase: UpdateResearcherLinksUseCase,
  ) {}

  @Get('filters')
  getFilters(@Query() query: ResearchersFiltersRequestQueryDto) {
    return this.getResearchersFiltersUseCase.execute(query.q, {
      unit: query.unit,
      collaborationCountry: query.collaborationCountry,
    });
  }

  // Separate (slow) facet so the unit filter above is never blocked by it.
  @Get('filters/collaboration')
  getCollaborationFacet(@Query() query: ResearchersFiltersRequestQueryDto) {
    return this.getResearchersCollaborationFacetUseCase.execute(query.q, {
      unit: query.unit,
      collaborationCountry: query.collaborationCountry,
    });
  }

  @Get('anidated')
  async getResearchersPaginatedListAnidated(
    @Query() query: ResearchersListRequestAnidatedDto,
  ): Promise<PaginatedListResponseDto<ResearcherSummaryResponseDto>> {
    const researchers = await this.getResearchersPaginatedListUseCase.execute(query);

    return researchers;
  }

  @Get()
  async getResearchersPaginatedList(
    @Query() query: ResearchersListRequestDto,
  ): Promise<PaginatedListResponseDto<ResearcherSummaryResponseDto>> {
    const researchers = await this.getResearchersPaginatedListUseCase.execute(query);

    return researchers;
  }

  @Get(':id/profile')
  async getResearcherProfile(
    @Param('id') id: string,
  ): Promise<ResearcherProfileResponseDto> {
    return await this.getResearcherProfileUseCase.execute(id);
  }

  @Get(':id/collaboration-countries')
  async getResearcherCollaborationCountries(@Param('id') id: string) {
    return await this.getResearcherCollaborationCountriesUseCase.execute(id);
  }

  @Get(':id')
  async getResearcherDetail(
    @Param('id') id: string,
  ): Promise<ResearcherSummaryResponseDto> {
    return await this.getResearcherDetailUseCase.execute(id);
  }

  @Patch(':id/links')
  @HttpCode(HttpStatus.OK)
  async updateResearcherLinks(
    @Param('id') id: string,
    @Body() dto: UpdateResearcherLinksDto,
  ): Promise<ResearcherProfileResponseDto> {
    await this.updateResearcherLinksUseCase.execute(id, dto);
    return await this.getResearcherProfileUseCase.execute(id);
  }
}
