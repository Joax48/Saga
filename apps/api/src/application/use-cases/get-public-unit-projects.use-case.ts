import { Inject, Injectable } from '@nestjs/common';

import { UnitProjectResponseDto } from '../../bff/public/units/dtos/unit-project-response.dto';
import {
  UNITS_READER,
  type UnitsReader,
} from '../../modules/units/units.reader.contract';

@Injectable()
export class GetPublicUnitProjectsUseCase {
  constructor(
    @Inject(UNITS_READER)
    private readonly unitsReader: UnitsReader,
  ) {}

  async execute(unitId: number): Promise<UnitProjectResponseDto[]> {
    const projects = await this.unitsReader.getProjectsByUnitId(unitId);

    return projects.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      managerName: p.managerName,
      managerId: p.managerId,
      startDate: p.startDate,
      endDate: p.endDate,
      researchType: p.researchType,
      projectType: p.projectType,
      keywords: p.keywords,
    }));
  }
}
