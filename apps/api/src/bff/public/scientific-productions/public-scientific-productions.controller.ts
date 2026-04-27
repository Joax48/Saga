import { Controller, Get, Param, Query } from '@nestjs/common';

import { PaginatedListResponseDto } from '../common/dtos/paginated-list-response.dto';
import { ScientificProductioSummaryResponseDto } from './dtos/public-scientific-productions-summary-response.dto';
import { ScientificProductionDetailResponseDto } from './dtos/public-scientific-production-detail-response.dto';

import { GetScientificProductionPaginatedListUseCase } from '../../../application/use-cases/get-public-scientific-productions-paginated-list.use-case';
import { GetScientificProductionDetailUseCase } from '../../../application/use-cases/get-public-scientific-production-detail.use-case';
import { ScientificProductionsListRequestDto } from './dtos/scientific-productions-list-request.dto';

@Controller('scientific-productions')
export class PublicScientificProductionsController {
  constructor(
    private readonly getScientificProductionPaginatedListUseCase: GetScientificProductionPaginatedListUseCase,
    private readonly getScientificProductionDetailUseCase: GetScientificProductionDetailUseCase,
  ) {}

  @Get()
  async getScientificProductionsPaginatedList(
    @Query() query: ScientificProductionsListRequestDto,
  ): Promise<PaginatedListResponseDto<ScientificProductioSummaryResponseDto>> {
    return this.getScientificProductionPaginatedListUseCase.execute(query);
  }

  @Get(':id')
  async getScientificProductionDetail(
    @Param('id') id: string,
  ): Promise<ScientificProductionDetailResponseDto> {
    return this.getScientificProductionDetailUseCase.execute(id);
  }
}
