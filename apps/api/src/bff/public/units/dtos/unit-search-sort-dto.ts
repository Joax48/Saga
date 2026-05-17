import { IsIn, IsOptional } from 'class-validator';

export type UnitSortBy = 'name';
export type UnitSortOrder = 'asc' | 'desc';

export class UnitSearchSortDTO {
  @IsOptional()
  @IsIn(['name'])
  sortBy: UnitSortBy = 'name';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: UnitSortOrder = 'asc';
}
