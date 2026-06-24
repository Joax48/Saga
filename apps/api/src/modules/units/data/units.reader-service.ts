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
          logoSvgContent: unit.logoSvgContent,
          logoUnitAcronym: unit.logoUnitAcronym,
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
    const [researchers, researchersByBaseUnit] = await Promise.all([
      this.unitsRepository.findResearchersForUnits(q),
      this.unitsRepository.findResearchersForUnitsByBaseUnit(q),
    ]);

    return {
      researchers: researchers.map((r) => ({
        value: String(r.id),
        label: [r.name, r.firstSurname].filter(Boolean).join(' '),
        count: r.count,
      })),
      researchersByBaseUnit: researchersByBaseUnit.map((r) => ({
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
    const rows = await this.unitsRepository.findScientificProductionsByUnitId(unitId);

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      authors: this.parseJsonSafely<{ id: number; name: string }[]>(row.authors, []),
      type: row.type,
      openAccess: row.openAccess,
      publicationYear: row.publicationYear,
      doi: row.doi,
      journal: row.journal,
      pages: row.pages,
      source: row.source,
      volume: row.volume,
      issue: row.issue,
      keywords: this.parseJsonSafely<{ id: number; value: string }[]>(row.keywords, []),
    }));
  }

  private parseJsonSafely<T>(value: unknown, fallback: T): T {
    if (value === null || value === undefined || value === '') return fallback;

    if (Buffer.isBuffer(value)) {
      value = value.toString('utf8');
    }

    if (typeof value !== 'string') return value as T;
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }

  async getProjectsByUnitId(unitId: number): Promise<UnitProjectDto[]> {
    return this.unitsRepository.findProjectsByUnitId(unitId);
  }
}
