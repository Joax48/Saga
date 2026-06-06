import { UnitSearchDTO } from '../../bff/public/units/dtos/unit-search-dto';
import { UnitSearchFiltersDTO } from '../../bff/public/units/dtos/unit-search-filters-dto';
import { UnitSearchSortDTO } from '../../bff/public/units/dtos/unit-search-sort-dto';
import { UnitFiltersResponseDto } from '../../bff/public/units/dtos/unit-filters-response.dto';

export const UNITS_READER = Symbol('UNITS_READER');

export interface UnitListItemDto {
  id: number;
  name: string;
  logoSvgContent: string | null;
  logoUnitAcronym: string | null;
}

export interface UnitDetailDto {
  id: number;
  name: string;
  description: string;
  email: string;
  pageUrl: string;
  phoneNumber: string;
}

export interface UnitProfileDto {
  id: number;
  baseUnit: string | null;
  name: string;
  ceaCategory: string | null;
  photoUrl: string | null;
}

export interface UnitScientificProductionDto {
  id: string;
  title: string;
  authors: string;
  type: string;
  publicationYear: number;
  doi: string | null;
  journal: string | null;
  volume: number | null;
  issue: number | null;
  pages: string | null;
  keywords: string;
}

export interface UnitProjectDto {
  id: string;
  code: string;
  name: string;
  managerName: string;
  managerId: number;
  startDate: string;
  endDate: string;
  researchType: string;
  projectType: string;
  keywords: string | null;
}

export interface UnitsPaginatedListDto {
  items: UnitListItemDto[];
  page: number;
  limit: number;
  total: number;
}

export interface UnitsReader {
  getPaginatedList(searchDTO: UnitSearchDTO): Promise<UnitsPaginatedListDto>;
  getById(id: number): Promise<UnitDetailDto | null>;
  getFilterOptions(q?: string): Promise<UnitFiltersResponseDto>;
  getProfilesByUnitId(unitId: number): Promise<UnitProfileDto[]>;
  getScientificProductionsByUnitId(
    unitId: number,
  ): Promise<UnitScientificProductionDto[]>;
  getProjectsByUnitId(unitId: number): Promise<UnitProjectDto[]>;
}
