import { Injectable } from '@nestjs/common';
import type {
  UnitListItemDto,
  UnitsPaginatedListDto,
  UnitsReader,
} from '../units.reader.contract';
import { UnitsRepository } from './units.repository';

@Injectable()
export class UnitsReaderService implements UnitsReader {
  constructor(private readonly unitsRepository: UnitsRepository) {}

  async getPaginatedList(
    page: number,
    limit: number,
    search?: string,
  ): Promise<UnitsPaginatedListDto> {
    const unitsPage = await this.unitsRepository.findPaginated(page, limit, search);

    return {
      items: unitsPage.items.map(
        (unit): UnitListItemDto => ({
          id: unit.id,
          name: unit.name,
          imageUrl: unit.imageUrl,
        }),
      ),
      page,
      limit,
      total: unitsPage.total,
    };
  }
}
