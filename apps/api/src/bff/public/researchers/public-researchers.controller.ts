import { Controller, Get, Param, Query } from '@nestjs/common';

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

@Controller('researchers')
export class PublicResearchersController {
  constructor(
    private readonly getResearchersPaginatedListUseCase: GetResearchersPaginatedListUseCase,
    private readonly getResearcherDetailUseCase: GetResearcherDetailUseCase,
    private readonly getResearcherProfileUseCase: GetResearcherProfileUseCase,
    private readonly getResearchersFiltersUseCase: GetResearchersFiltersUseCase,
  ) {}

  @Get('filters')
  getFilters(@Query() query: ResearchersFiltersRequestQueryDto) {
    return this.getResearchersFiltersUseCase.execute(query.q, { unit: query.unit });
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

  @Get(':id')
  async getResearcherDetail(
    @Param('id') id: string,
  ): Promise<ResearcherSummaryResponseDto> {
    return await this.getResearcherDetailUseCase.execute(id);
  }
}
