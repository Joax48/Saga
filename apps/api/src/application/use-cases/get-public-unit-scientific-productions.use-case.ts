import { Inject, Injectable } from '@nestjs/common';

import { UnitScientificProductionResponseDto } from '../../bff/public/units/dtos/unit-scientific-production-response.dto';
import {
  UNITS_READER,
  type UnitsReader,
} from '../../modules/units/units.reader.contract';

@Injectable()
export class GetPublicUnitScientificProductionsUseCase {
  constructor(
    @Inject(UNITS_READER)
    private readonly unitsReader: UnitsReader,
  ) {}

  async execute(unitId: number): Promise<UnitScientificProductionResponseDto[]> {
    const productions = await this.unitsReader.getScientificProductionsByUnitId(unitId);

    return productions.map((p) => ({
      id: p.id,
      title: p.title,
      authors: p.authors,
      type: p.type,
      openAccess: p.openAccess,
      publicationYear: p.publicationYear,
      doi: p.doi,
      journal: p.journal,
      pages: p.pages,
      source: p.source,
      keywords: p.keywords,
    }));
  }
}
