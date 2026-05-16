import { UnitSearchDTO } from '../../bff/public/units/dtos/unit-search-dto';
import { UnitSearchFiltersDTO } from '../../bff/public/units/dtos/unit-search-filters-dto';
import { UnitSearchSortDTO } from '../../bff/public/units/dtos/unit-search-sort-dto';

export const UNITS_READER = Symbol('UNITS_READER');

export interface UnitListItemDto {
  id: number;
  name: string;
  imageUrl: string;
}

export interface UnitDetailDto {
  id: number;
  name: string;
  description: string;
  email: string;
  pageUrl: string;
  phoneNumber: string;
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
}
