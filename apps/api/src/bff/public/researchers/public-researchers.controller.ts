import { Controller, Get, Query } from '@nestjs/common';

import { PaginatedListResponseDto } from '../common/dtos/paginated-list-response.dto';
import { ResearcherSummaryResponseDto } from './dtos/researcher-summary-response.dto';
import { ResearchersListRequestDto } from './dtos/researchers-list-request.dto';
import { GetResearchersPaginatedListUseCase } from '../../../application/use-cases/get-public-researchers-paginated-list.use-case';

@Controller('researchers')
export class PublicResearchersController {
  constructor(
    private readonly getResearchersPaginatedListUseCase: GetResearchersPaginatedListUseCase,
  ) {}

  @Get()
  async getResearchersPaginatedList(
    @Query() query: ResearchersListRequestDto,
  ): Promise<PaginatedListResponseDto<ResearcherSummaryResponseDto>> {
    const researchers = await this.getResearchersPaginatedListUseCase.execute(query);

    return researchers;
  }
}
