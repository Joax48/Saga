import { IsIn } from 'class-validator';

export type UnitSortBy = 'name';
export type UnitSortOrder = 'asc' | 'desc';

export class UnitSearchSortDTO {
  @IsIn(['name'])
  sortBy: UnitSortBy;

  @IsIn(['asc', 'desc'])
  sortOrder: UnitSortOrder;

  constructor(sortBy: UnitSortBy = 'name', sortOrder: UnitSortOrder = 'asc') {
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
  }
}
