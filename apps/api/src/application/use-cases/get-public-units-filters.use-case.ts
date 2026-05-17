import { Inject, Injectable } from '@nestjs/common';

import { UNITS_READER, UnitsReader } from '../../modules/units/units.reader.contract';
import { UnitFiltersRequestDto } from '../../bff/public/units/dtos/unit-filters-request.dto';
import { UnitFiltersResponseDto } from '../../bff/public/units/dtos/unit-filters-response.dto';

@Injectable()
export class GetUnitsFiltersUseCase {
  constructor(
    @Inject(UNITS_READER)
    private readonly unitsReader: UnitsReader,
  ) {}

  execute(query: UnitFiltersRequestDto): Promise<UnitFiltersResponseDto> {
    return this.unitsReader.getFilterOptions(query.q);
  }
}
