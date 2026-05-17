import { Injectable } from '@nestjs/common';
import type {
  UnitDetailDto,
  UnitListItemDto,
  UnitsPaginatedListDto,
  UnitsReader,
  UnitProfileDto,
  UnitScientificProductionDto,
  UnitProjectDto,
} from '../units.reader.contract';
import { UnitsRepository } from './units.repository';
import { UnitSearchDTO } from '../../../bff/public/units/dtos/unit-search-dto';
import { UnitFiltersResponseDto } from '../../../bff/public/units/dtos/unit-filters-response.dto';

@Injectable()
export class UnitsReaderService implements UnitsReader {
  constructor(private readonly unitsRepository: UnitsRepository) {}

  async getPaginatedList(searchDTO: UnitSearchDTO): Promise<UnitsPaginatedListDto> {
    const unitsPage = await this.unitsRepository.findPaginated(searchDTO);

    return {
      items: unitsPage.items.map(
        (unit): UnitListItemDto => ({
          id: unit.id,
          name: unit.name,
          imageUrl: unit.imageUrl,
        }),
      ),
      page: searchDTO.page,
      limit: searchDTO.limit,
      total: unitsPage.total,
    };
  }

  async getById(id: number): Promise<UnitDetailDto | null> {
    const unit = await this.unitsRepository.findById(id);

    if (!unit) return null;

    return {
      id: unit.id,
      name: unit.name,
      description: unit.description,
      email: unit.email,
      pageUrl: unit.pageUrl,
      phoneNumber: unit.phoneNumber,
    };
  }

  async getFilterOptions(q?: string): Promise<UnitFiltersResponseDto> {
    const researchers = await this.unitsRepository.findResearchersForUnits(q);

    return {
      researchers: researchers.map((r) => ({
        value: String(r.id),
        label: [r.name, r.firstSurname].filter(Boolean).join(' '),
        count: r.count,
      })),
    };
  }

  async getProfilesByUnitId(unitId: number): Promise<UnitProfileDto[]> {
    return this.unitsRepository.findProfilesByUnitId(unitId);
  }

  async getScientificProductionsByUnitId(
    unitId: number,
  ): Promise<UnitScientificProductionDto[]> {
    return this.unitsRepository.findScientificProductionsByUnitId(unitId);
  }

  async getProjectsByUnitId(unitId: number): Promise<UnitProjectDto[]> {
    return this.unitsRepository.findProjectsByUnitId(unitId);
  }
}
