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
  getPaginatedList(
    page: number,
    limit: number,
    search?: string,
  ): Promise<UnitsPaginatedListDto>;
  getById(id: number): Promise<UnitDetailDto | null>;
}
