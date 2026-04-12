import { Controller, Get, Query } from '@nestjs/common';

import { PaginatedListRequestDto } from '../common/dtos/paginated-list-request.dto';
import { PaginatedListResponseDto } from '../common/dtos/paginated-list-response.dto';
import { UnitSummaryResponseDto } from './dtos/unit-summary-response.dto';

import { GetUnitsPaginatedListUseCase } from '../../../application/use-cases/get-public-units-paginated-list.use-case';

@Controller('units')
export class PublicUnitsController {
  constructor(
    private readonly getUnitsPaginatedListUseCase: GetUnitsPaginatedListUseCase,
  ) {}

  @Get()
  async getUnitsPaginatedList(
    @Query() query: PaginatedListRequestDto,
  ): Promise<PaginatedListResponseDto<UnitSummaryResponseDto>> {
    const units = await this.getUnitsPaginatedListUseCase.execute(query);

    return units;
  }
}
