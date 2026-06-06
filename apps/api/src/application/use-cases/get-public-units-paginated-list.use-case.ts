import { Inject, Injectable } from '@nestjs/common';

import { PaginatedListRequestDto } from '../../bff/public/common/dtos/paginated-list-request.dto';
import { PaginatedListResponseDto } from '../../bff/public/common/dtos/paginated-list-response.dto';
import { UnitSummaryResponseDto } from '../../bff/public/units/dtos/unit-summary-response.dto';

import {
  UNITS_READER,
  type UnitsPaginatedListDto,
  type UnitsReader,
} from '../../modules/units/units.reader.contract';
import { UnitSearchDTO } from '../../bff/public/units/dtos/unit-search-dto';

@Injectable()
export class GetUnitsPaginatedListUseCase {
  constructor(
    @Inject(UNITS_READER)
    private readonly unitsReader: UnitsReader,
  ) {}

  async execute(
    input: UnitSearchDTO,
  ): Promise<PaginatedListResponseDto<UnitSummaryResponseDto>> {
    const units = await this.unitsReader.getPaginatedList(input);

    return this.mapToResponseDto(units);
  }

  private mapToResponseDto(
    units: UnitsPaginatedListDto,
  ): PaginatedListResponseDto<UnitSummaryResponseDto> {
    return {
      items: units.items.map((unit) => ({
        id: unit.id,
        name: unit.name,
        logoSvgContent: unit.logoSvgContent,
        logoUnitAcronym: unit.logoUnitAcronym,
      })),
      page: units.page,
      limit: units.limit,
      total: units.total,
    };
  }
}
