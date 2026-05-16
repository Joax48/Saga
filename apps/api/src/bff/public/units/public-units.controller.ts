import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { PaginatedListRequestDto } from '../common/dtos/paginated-list-request.dto';
import { PaginatedListResponseDto } from '../common/dtos/paginated-list-response.dto';
import { UnitSummaryResponseDto } from './dtos/unit-summary-response.dto';
import { UnitDetailResponseDto } from './dtos/unit-detail-response.dto';

import { GetUnitsPaginatedListUseCase } from '../../../application/use-cases/get-public-units-paginated-list.use-case';
import { GetPublicUnitDetailUseCase } from '../../../application/use-cases/get-public-unit-detail.use-case';
import { UnitSearchFiltersDTO } from './dtos/unit-search-filters-dto';
import { UnitSearchSortDTO } from './dtos/unit-search-sort-dto';
import { UnitSearchDTO } from './dtos/unit-search-dto';

@Controller('units')
export class PublicUnitsController {
  constructor(
    private readonly getUnitsPaginatedListUseCase: GetUnitsPaginatedListUseCase,
    private readonly getPublicUnitDetailUseCase: GetPublicUnitDetailUseCase,
  ) {}

  @Get()
  async getUnitsPaginatedList(
    @Query() query: UnitSearchDTO,
  ): Promise<PaginatedListResponseDto<UnitSummaryResponseDto>> {
    return this.getUnitsPaginatedListUseCase.execute(query);
  }

  @Get(':id')
  async getUnitDetail(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UnitDetailResponseDto> {
    return this.getPublicUnitDetailUseCase.execute(id);
  }
}
