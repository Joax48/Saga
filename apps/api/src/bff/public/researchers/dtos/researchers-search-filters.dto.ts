import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';

import { normalizeStringArray } from '../../common/dtos/query-transformers';

export class ResearchersSearchFiltersDto {
  @IsOptional()
  @Transform(({ value }) => normalizeStringArray(value))
  @IsArray()
  @IsString({ each: true })
  unit?: string[];
}
