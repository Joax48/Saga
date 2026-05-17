import { Inject, Injectable } from '@nestjs/common';

import { UnitProfileResponseDto } from '../../bff/public/units/dtos/unit-profile-response.dto';
import {
  UNITS_READER,
  type UnitsReader,
} from '../../modules/units/units.reader.contract';

@Injectable()
export class GetPublicUnitProfilesUseCase {
  constructor(
    @Inject(UNITS_READER)
    private readonly unitsReader: UnitsReader,
  ) {}

  async execute(unitId: number): Promise<UnitProfileResponseDto[]> {
    const profiles = await this.unitsReader.getProfilesByUnitId(unitId);

    return profiles.map((profile) => ({
      id: profile.id,
      baseUnit: profile.baseUnit,
      name: profile.name,
      ceaCategory: profile.ceaCategory,
      photoUrl: profile.photoUrl,
    }));
  }
}
