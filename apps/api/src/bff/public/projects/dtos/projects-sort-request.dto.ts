import { IsIn, IsOptional } from 'class-validator';

export type ProjectSortBy = 'title' | 'year' | 'code';
export type ProjectSortOrder = 'asc' | 'desc';

export class ProjectsSortRequestDto {
  @IsOptional()
  @IsIn(['title', 'year', 'code'])
  sortBy?: ProjectSortBy = 'title';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: ProjectSortOrder = 'asc';
}
