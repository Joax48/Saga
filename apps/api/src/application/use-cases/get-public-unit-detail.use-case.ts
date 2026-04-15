import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { UnitDetailResponseDto } from '../../bff/public/units/dtos/unit-detail-response.dto';
import {
  UNITS_READER,
  type UnitsReader,
} from '../../modules/units/units.reader.contract';

@Injectable()
export class GetPublicUnitDetailUseCase {
  constructor(
    @Inject(UNITS_READER)
    private readonly unitsReader: UnitsReader,
  ) {}

  async execute(id: number): Promise<UnitDetailResponseDto> {
    const unit = await this.unitsReader.getById(id);

    if (!unit) {
      throw new NotFoundException(`Unit with id ${id} not found`);
    }

    return {
      id: unit.id,
      name: unit.name,
      description: unit.description,
      email: unit.email,
      pageUrl: unit.pageUrl,
      phoneNumber: unit.phoneNumber,
    };
  }
}
