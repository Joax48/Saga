import { Controller, Get, Query } from '@nestjs/common';

import { PaginatedListRequestDto } from '../common/dtos/paginated-list-request.dto';
import { PaginatedListResponseDto } from '../common/dtos/paginated-list-response.dto';
import { ScientificProductioSummaryResponseDto } from './dtos/public-scientific-productions-summary-response.dto';

import { GetScientificProductionPaginatedListUseCase } from '../../../application/use-cases/get-public-scientific-productions-paginated-list.use-case';

@Controller('scientific-productions')
export class PublicScientificProductionsController {
  constructor(
    private readonly getScientificProductionPaginatedListUseCase: GetScientificProductionPaginatedListUseCase,
  ) {}

  @Get()
  async getScientificProductionsPaginatedList(
    @Query() query: PaginatedListRequestDto,
  ): Promise<PaginatedListResponseDto<ScientificProductioSummaryResponseDto>> {
    const scientificProductions =
      await this.getScientificProductionPaginatedListUseCase.execute(query);

    return scientificProductions;
  }
}
