import { Controller, Get, Param, Query } from '@nestjs/common';

import { PaginatedListResponseDto } from '../common/dtos/paginated-list-response.dto';
import { ResearcherSummaryResponseDto } from './dtos/researcher-summary-response.dto';
import { ResearchersListRequestDto } from './dtos/researchers-list-request.dto';
import { ResearchersListRequestAnidatedDto } from './dtos/researchers-list-request-anidated.dto';
import { GetResearchersPaginatedListUseCase } from '../../../application/use-cases/get-public-researchers-paginated-list.use-case';
import { GetResearcherDetailUseCase } from '../../../application/use-cases/get-public-researcher-detail.use-case';
import { GetResearchersFiltersUseCase } from '../../../application/use-cases/get-public-researchers-filters.use-case';

@Controller('researchers')
export class PublicResearchersController {
  constructor(
    private readonly getResearchersPaginatedListUseCase: GetResearchersPaginatedListUseCase,
    private readonly getResearcherDetailUseCase: GetResearcherDetailUseCase,
    private readonly getResearchersFiltersUseCase: GetResearchersFiltersUseCase,
  ) {}

  @Get('filters')
  getFilters() {
    return this.getResearchersFiltersUseCase.execute();
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

  @Get(':id')
  async getResearcherDetail(
    @Param('id') id: string,
  ): Promise<ResearcherSummaryResponseDto> {
    return await this.getResearcherDetailUseCase.execute(id);
  }
}
