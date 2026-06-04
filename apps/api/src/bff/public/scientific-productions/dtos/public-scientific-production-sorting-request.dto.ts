import { IsIn, IsOptional } from 'class-validator';

type ScientificProductionSortBy = 'title' | 'publication_year';
type ScientificProductionSortOrder = 'asc' | 'desc';

export class ScientificProductionSortDto {
  @IsOptional()
  @IsIn(['title', 'publication_year'])
  sortBy?: ScientificProductionSortBy = 'publication_year';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: ScientificProductionSortOrder = 'desc';
}
