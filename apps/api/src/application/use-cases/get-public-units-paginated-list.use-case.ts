import { Inject, Injectable } from '@nestjs/common';

import { PaginatedListRequestDto } from '../../bff/public/common/dtos/paginated-list-request.dto';
import { PaginatedListResponseDto } from '../../bff/public/common/dtos/paginated-list-response.dto';
import { UnitSummaryResponseDto } from '../../bff/public/units/dtos/unit-summary-response.dto';

import {
  UNITS_READER,
  type UnitsPaginatedListDto,
  type UnitsReader,
} from '../../modules/units/units.reader.contract';

@Injectable()
export class GetUnitsPaginatedListUseCase {
  constructor(
    @Inject(UNITS_READER)
    private readonly unitsReader: UnitsReader,
  ) {}

  async execute(
    input: PaginatedListRequestDto,
  ): Promise<PaginatedListResponseDto<UnitSummaryResponseDto>> {
    const units = await this.unitsReader.getPaginatedList(input.page, input.limit, input.q);

    return this.mapToResponseDto(units);
  }

  private mapToResponseDto(
    units: UnitsPaginatedListDto,
  ): PaginatedListResponseDto<UnitSummaryResponseDto> {
    return {
      items: units.items.map((unit) => ({
        id: unit.id,
        name: unit.name,
        imageUrl: unit.imageUrl,
      })),
      page: units.page,
      limit: units.limit,
      total: units.total,
    };
  }
}
